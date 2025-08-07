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
from langchain_core.documents import Document
from collections import OrderedDict
from pypdf import PdfReader  # get pubno


class zhuanli_parser:
    def __init__(self, markdown_file: str):
        self.markdown_file = markdown_file
        self.ims_dir = Path(markdown_file).parent / "images"
        self.data_dir = os.path.dirname(markdown_file)
        self.loaded_docs = []
        self.metada_schema = OrderedDict({
            "pubno": str,
            "patent_name": str,
            "applier": str,
            "apply_time": str,
            "fig_list": dict,
        }) # 申请公布号 专利名称 申请人 发明人 申请时间 配图{"图1": [str(description),str(path/to/1.jpg)], }
    
    def __call__(self):
        self.loaded_docs = self._load_with_image()
        
    def _extract_imMatadata(self):
        with open(self.markdown_file, "r", encoding='utf-8') as f:
            content = f.read()
        """ 从markdown文本中提取图片元数据 """
        # 1 提取“附图说明”标题及其内容（直到下一个标题或文件结尾）
        pattern = re.compile(
            r'^(#{1,3})\s*附图说明\s*\n+\s*([\s\S]*?)(?=^#{1,3}|\Z)',
            re.MULTILINE)
        match = pattern.search(content)
        if not match:
            print(f"⚠️ markdown file {md_path.stem} 未找到 '附图说明' 章节，跳过处理。")
            return content

        header_line = match.group(1)  # 比如 "##"
        body = match.group(2).strip()
        img_map = {}
        # 匹配：图片行 + 紧接着的“图X”行
        img_blocks = re.findall(r'!\[.*?\]\((.*?)\)\s*\n\s*图(\d+)', text, re.IGNORECASE)
        for path, num in img_blocks:
            img_map[f"图{num}"] = path.strip()

        # 获取图片的图题： "图x": [decs, img_path]
        fig_num, desc = body.groups()
        img_path = img_map.get(f"图{fig_num}")
        img_path = os.path.abspath(img_path)
        assert os.path.exists(img_path), f"图片路径不存在: {img_path}"
        if img_path:
            return {"图"+fig_num: [{desc}, str(img_path)]}
        else:
            print(f"⚠️ {os.path.basename(self.markdown_file)}未找到图{fig_num}的路径，跳过处理。")
            return match.group(0)  # 无图则保持原样
            
            
    
    def _extract_pubno(self):
        # 专利pdf第一页最后一行 -> 申请公告号
        pdfp = str(self.markdown_file)[:-3] + ".pdf"
        reader = PdfReader(pdfp)
        text_1 = reader.pages[0].extract_text() or ""
        last_line = text_1.strip().splitlines()[-1]

        # 去掉空格后匹配
        compact = re.sub(r'\s+', '', last_line.upper())
        m = re.search(r'(CN[A-Z0-9]{9,13})', compact)
        if m:
            return m.group(0)
        else:
            raise ValueError(f"专利 {os.path.basename(pdfp)} 未找到 申请公告号 的字符串")    
        
    
    def _load_with_image(self) -> List[Document]:
        with open(self.markdown_file, "r", encoding='utf-8') as f:
            content = f.read()
            image_paths = self._extract_image_paths(content)
            abs_image_paths = [os.path.join(self.data_dir, image_path) for image_path in image_paths]
            
            doc = Document(
                page = content,
                metadata = OrderedDict({
                    "source_path": str(self.markdown_file),
                    "file_stem": os.path.basename(self.markdown_file).split(".")[0],
                    "file_suffix": os.path.basename(self.markdown_file).split(".")[1],
                    "file_size": os.path.getsize(self.markdown_file),
                    "image_paths": abs_image_paths
                })  # 
            ) 
            return [doc]
    def pipeline(self):
        pass 


def get_im_matadata(markdown_text: str):
    """ 从markdown文本中提取图片元数据 """
    
    # 1 提取“附图说明”标题及其内容（直到下一个标题或文件结尾）
    pattern = re.compile(
        r'^(#{1,3})\s*附图说明\s*\n+\s*([\s\S]*?)(?=^#{1,3}|\Z)',
        re.MULTILINE)
    match = pattern.search(text)
    if not match:
        print(f"⚠️ markdown file {md_path.stem} 未找到 '附图说明' 章节，跳过处理。")
        return text

    header_line = match.group(1)  # 比如 "##"
    body = match.group(2).strip()
    img_map = {}
    # 匹配：图片行 + 紧接着的“图X”行
    img_blocks = re.findall(r'!\[.*?\]\((.*?)\)\s*\n\s*图(\d+)', text, re.IGNORECASE)
    for path, num in img_blocks:
        img_map[f"图{num}"] = path.strip()

    # 获取图片的图题： 图x-decs
    def repl(match):
        fig_num, desc = match.groups()
        img_path = img_map.get(f"图{fig_num}")
        if img_path:
            return {"图"+fig_num: [{desc}, str(img_path)]}
        else:
            print(f"⚠️ {os.path.basename(self.markdown_file)}未找到图{fig_num}的路径，跳过处理。")
            return match.group(0)  # 无图则保持原样
        




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
                        loader = UnstructuredMarkdownLoader(str(md_file), mode="single")  # single 
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
    "model_dir_local": r"../deepdocs/mineru_models/Qwen3-Embedding-0.6B",
    "store_dir": r"../docs.log/chroma_db/.zhuanli_vectdb",
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
    
      













