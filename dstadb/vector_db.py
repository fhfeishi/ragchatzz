# /dataDB/vector_db.py
#   将 < 图文markdown > 写入向量数据库 chroma_db
import os, hashlib, re, uuid 
from pathlib import Path
from typing import List, Union
from tqdm import tqdm

# 使用 Unstructured 更好地解析 Markdown 中的图片链接
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores.utils import filter_complex_metadata # 过滤复杂元数据 chroma只支持: str int float bool None


class VectorIngestor:
    def __init__(self, config: dict):
        self.config = config
        self.embeddings = self._load_embedding_model()
        self.vectordb = self._init_vectorstore()

    def _load_embedding_model(self):
        modeln = self.config["embed_model"]
        base_url = self.config.get("base_url")
        device = self.config.get("device", "cpu")

        if modeln.startswith("ollama:"):
            model_name = modeln[7:]
            print(f"[*] 使用 Ollama 嵌入模型: {model_name}")
            return OllamaEmbeddings(model=model_name, base_url=base_url)

        else:
            print(f"[*] 使用 HuggingFace 嵌入模型: {modeln}")
            
            # 判断是否是本地路径下加载模型
            local_model_dir = self.config.get("model_dir_local", "")
            if Path(local_model_dir).exists() and Path(local_model_dir).is_dir():
                print(f"[*] 从本地加载嵌入模型: {local_model_dir}")
                model_path_orn = local_model_dir
            else:
                print(f"[*] 本地模型路径不存在，尝试从 HuggingFace (或者.cache缓存) 加载: {modeln}")
                model_path_orn = modeln
            print(f"✅ 模型加载完成: {modeln}")
            return HuggingFaceEmbeddings(
                model_name=model_path_orn,  # model_path or model_name
                model_kwargs={"device": device},
                encode_kwargs={"normalize_embeddings": True},
                cache_folder=None,  # 不使用额外缓存
            )

    def _init_vectorstore(self) -> Chroma:
        return Chroma(
            collection_name=self.config["collection_name"],
            embedding_function=self.embeddings,
            persist_directory=self.config["store_dir"],
        )

    def load_docs(self, roots: Union[str, Path]) -> List:
        """递归加载 .md 文件，使用 Unstructured 解析（保留图片引用）"""
        roots = [Path(r) for r in roots]
        docs = []
        
        for root in roots:
            if not Path(root).exists():
                print(f"[WARN] 根目录不存在: {root}")
                continue
            
            # 匹配 root/*/auto
            for auto_dir in root.glob("*/auto"):
                if not auto_dir.is_dir():
                    print(f"[WARN] 跳过文件 {root}")
                    continue
                
                md_dir = auto_dir  # *.md 放在 auto/ 目录下
                img_dir = auto_dir / "images"  # 图片在 auto/images/
                
                # 加载所有 .md 文件
                for md_file in md_dir.glob("*.md"):
                    try:
                        loader = UnstructuredMarkdownLoader(str(md_file), mode="elements")  # single 
                        loaded_docs = loader.load()

                        for doc in loaded_docs:
                            source_path = str(md_file.resolve())
                            doc.metadata.update({
                                "source_path": source_path,
                                "file_stem": md_file.stem,
                                "file_suffix": md_file.suffix,
                                "file_size": md_file.stat().st_size,
                                "auto_root": str(auto_dir),  # 标记来源
                            })

                            # 提取图片引用（如: ![](images/solar.png)）
                            image_paths = re.findall(r"!\[.*?\]\((.+?)\)", doc.page_content)
                            if image_paths:
                                resolved_images = []
                                for img_ref in image_paths:
                                    img_ref = img_ref.strip()
                                    # 尝试解析为相对于 auto/ 目录的路径
                                    if img_ref.startswith("images/"):
                                        img_full = (auto_dir / img_ref).resolve()
                                        if img_full.exists():
                                            resolved_images.append(str(img_full))

                                if resolved_images:
                                    doc.metadata["image_paths"] = resolved_images

                        docs.extend(loaded_docs)

                    except Exception as e:
                        print(f"[WARN] 解析文件失败 {md_file}: {e}")


                # # 可选：也支持 PDF（但不处理其中图片）
                # for fp in root.rglob("*.pdf"):
                #     try:
                #         loader = PyPDFLoader(str(fp))
                #         loaded_docs = loader.load()
                #         for doc in loaded_docs:
                #             doc.metadata["source_path"] = str(fp.resolve())
                #             doc.metadata["file_stem"] = fp.stem
                #             doc.metadata["file_suffix"] = ".pdf"
                #         docs.extend(loaded_docs)
                #     except Exception as e:
                #         print(f"[WARN] 跳过 PDF {fp}: {e}")

        print(f"[*] 成功加载 {len(docs)} 个文档")
        return docs

    def split_docs(self, docs: List, chunk_size: int, chunk_overlap: int) -> List:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        chunks = splitter.split_documents(docs)
        print(f"[*] 切分为 {len(chunks)} 个文本块")
        return chunks

    @staticmethod
    def make_id(doc, index: int) -> str:
        # 多个文档块的内容可能完全相同（尤其是短文本或重复段落），导致 ID 重复，ChromaDB 拒绝插入重复 ID。用uuid随机数编码一下
        content = doc.page_content.strip()
        sha = hashlib.sha1(content.encode("utf-8")).hexdigest()[:8]
        stem = Path(doc.metadata.get("source_path", "chunk")).stem
        return f"{sha}_{stem}_{index}_{uuid.uuid4().hex[:4]}"

    def get_existing_ids(self) -> set:
        try:
            return set(self.vectordb.get()["ids"])
        except Exception as e:
            print(f"[INFO] 未检测到现有向量库，将创建新的: {e}")
            return set()

    def ingest(self):
        raw_docs = self.load_docs(self.config["docs_roots"])
        # 过滤掉不支持的字符
        raw_docs = filter_complex_metadata(raw_docs)
        if not raw_docs:
            print("[WARN] 没有找到任何文档，终止索引。")
            return
        
        chunks = self.split_docs(raw_docs, self.config["chunk_size"], self.config["chunk_overlap"])
        
        chunk_ids = [self.make_id(chunk, i) for i, chunk in enumerate(chunks)]

        existing_ids = self.get_existing_ids()
        to_add = [(chunk, cid) for chunk, cid in zip(chunks, chunk_ids) if cid not in existing_ids]

        if not to_add:
            print("[*] 没有新文档需要索引，无需更新。")
            return

        print(f"[*] 新增 {len(to_add)} 个文本块")

        batch_size = self.config["batch_size"]
        for i in tqdm(range(0, len(to_add), batch_size), desc="🔄 写入向量库"):
            batch = to_add[i:i + batch_size]
            docs, ids = zip(*batch)
            self.vectordb.add_documents(documents=docs, ids=list(ids))

        print(f"[✅] 索引完成！新增 {len(to_add)} 条，向量库存储于:\n    {self.config['store_dir']}")




if __name__ =="__main__": 
    # config 
    DEFAULT_CONFIG = {
    "docs_roots": [
        r"..\docs.log\zhuanli_RobotFeet",
        r"..\docs.log\zhuanli_RobotHand"
    ],
    "model_dir_local": "../temp/mineru_models/Qwen3-Embedding-0.6B",
    "store_dir": "../docs.log/chroma_db/.zhuanli_vectdb",
    "collection_name": "multi_domain_knowledge",
    "embed_model": "Qwen/Qwen3-Embedding-0.6B",
    "chunk_size": 480,  # 
    "chunk_overlap": 128,
    "batch_size": 16,
    "base_url": "http://localhost:11434",
    "device": "cpu",
}
    ingestor = VectorIngestor(DEFAULT_CONFIG)
    ingestor.ingest()
    
    # 带图片的markdown解析成什么样了？  这里可能遗漏了很多信息、或者说有非常多重复的短片段（段片段哪来的  chunk_size=480啊）
    # 分块之后数据是怎么样的？  这个也可以后续检索测试部分查看-
    
    
    # temp\mineru_models\models--Qwen--Qwen3-Embedding-0.6B
    # temp/mineru_models/models--Qwen--Qwen3-Embedding-0.6B
    
      













