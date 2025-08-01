# vector_db.py   将图文markdown写入向量数据库
import sys, os, hashlib, re 
from pathlib import Path
from typing import List, Union
from tqdm import tqdm

# 使用 Unstructured 更好地解析 Markdown 中的图片链接
from langchain_community.document_loaders import PyPDFLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings

class VectorIngestor:
    def __init__(self, config: dict):
        self.config = config
        self.embeddings = self._load_embedding_model()
        self.vectordb = self._init_vectorstore()

    def _load_embedding_model(self):
        model = self.config["embed_model"]
        base_url = self.config.get("base_url")
        device = self.config.get("device", "cpu")

        if model.startswith("ollama:"):
            model_name = model[7:]
            print(f"[*] 使用 Ollama 嵌入模型: {model_name}")
            return OllamaEmbeddings(model=model_name, base_url=base_url)

        else:
            print(f"[*] 使用 HuggingFace 嵌入模型: {model}")
            return HuggingFaceEmbeddings(
                model_name=model,
                model_kwargs={"device": device},
                encode_kwargs={"normalize_embeddings": True},
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
                        loader = UnstructuredMarkdownLoader(str(md_file), mode="elements")
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
    def make_id(doc) -> str:
        content = doc.page_content.strip()
        sha = hashlib.sha1(content.encode("utf-8")).hexdigest()[:16]
        stem = Path(doc.metadata.get("source_path", "chunk")).stem
        return f"{sha}_{stem}"

    def get_existing_ids(self) -> set:
        try:
            return set(self.vectordb.get()["ids"])
        except Exception as e:
            print(f"[INFO] 未检测到现有向量库，将创建新的: {e}")
            return set()

    def ingest(self):
        raw_docs = self.load_docs(self.config["docs_root"])
        if not raw_docs:
            print("[WARN] 没有找到任何文档，终止索引。")
            return
        
        chunks = self.split_docs(raw_docs, self.config["chunk_size"], self.config["chunk_overlap"])
        chunk_ids = [self.make_id(chunk) for chunk in chunks]

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
    "roots": [
        r".\docs.log\zhuanli_RobotFeet",
        r".\docs.log\zhuanli_RobotHand"
    ],
    "store_dir": "./docs.log/chroma_db/.zhuanli_vectdb",
    "collection_name": "multi_domain_knowledge",
    "embed_model": "Qwen/Qwen3-Embedding-0.6B",
    "chunk_size": 480,
    "chunk_overlap": 128,
    "batch_size": 16,
    "base_url": "http://localhost:11434",
    "device": "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES", "") != "" else "cpu",
}
    ingestor = VectorIngestor(DEFAULT_CONFIG)
    ingestor.ingest()
    
      







