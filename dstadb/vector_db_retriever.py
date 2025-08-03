# /dataDB/vector_db_retriver.py
import os, json
from typing import List, Dict, Any
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaEmbeddings

class VectorRetriever:
    def __init__(self, config: dict):
        self.config = config
        self.embeddings = self._load_embedding_model()
        self.vectordb = Chroma(
            collection_name=config["collection_name"],
            embedding_function=self.embeddings,
            persist_directory=config["store_dir"],
        )

    def _load_embedding_model(self):
        model = self.config["embed_model"]
        base_url = self.config.get("base_url")
        device = self.config.get("device", "cpu")

        if model.startswith("ollama:"):
            return OllamaEmbeddings(model=model[7:], base_url=base_url)
        else:
            return HuggingFaceEmbeddings(
                model_name=model,
                model_kwargs={"device": device},
                encode_kwargs={"normalize_embeddings": True},
            )

    def search(self,
               query: str,
               top_k: int = 5,
               score_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """
        返回结构:
        [
          {
            "text": "...",
            "score": 0.82,
            "images": ["/abs/path/1.png", "/abs/path/2.png"]
          },
          ...
        ]
        """
        docs = self.vectordb.similarity_search_with_score(query, k=top_k)
        results = []
        for doc, score in docs:
            if score < score_threshold:
                continue
            results.append({
                "text": doc.page_content,
                "score": float(score),
                "images": doc.metadata.get("image_paths", [])
            })
        return results


if __name__ == "__main__":
    """本地测试"""
    cfg = {
        "store_dir": "../docs.log/chroma_db/.zhuanli_vectdb",
        "collection_name": "multi_domain_knowledge",
        "embed_model": "Qwen/Qwen3-Embedding-0.6B",
        "device": "cuda"
    }
    retriever = VectorRetriever(cfg)
    while True:
        q = input("query> ").strip()
        if q.lower() in {"q", "quit"}:
            break
        for r in retriever.search(q, top_k=3):
            print("-" * 40)
            print("score:", r["score"])
            print("text :", r["text"][:200])
            print("imgs :", r["images"])