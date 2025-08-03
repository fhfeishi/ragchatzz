# /dataDB/app.py

# app.py
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from vector_db_retriever import VectorRetriever
import uvicorn
import os
from pathlib import Path

class Query(BaseModel):
    q: str
    top_k: int = 5

cfg = {
    "store_dir": "../docs.log/chroma_db/.zhuanli_vectdb",
    "collection_name": "multi_domain_knowledge",
    "embed_model": "Qwen/Qwen3-Embedding-0.6B",
    "device": "cpu"
}
retriever = VectorRetriever(cfg)

app = FastAPI(title="RAG-with-Images Demo")

# 把图片目录挂载成静态资源，前端才能直接访问
root = Path("../docs.log").resolve()
app.mount("/static", StaticFiles(directory=root, html=False), name="static")

@app.post("/search")
async def search_api(query: Query):
    try:
        results = retriever.search(query.q, top_k=query.top_k)
        # 把绝对路径转成可访问的 URL
        for r in results:
            r["images"] = ["/static" + str(Path(p).relative_to(root)) for p in r["images"]]
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def index():
    # 直接返回 index.html
    return FileResponse("index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)