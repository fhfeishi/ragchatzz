# src/agents/rag_agent.py
"""
RAG Agent 模块：负责检索与生成的核心逻辑
支持 HuggingFace / Ollama 模型
支持流式输出，可过滤 <think> 等中间推理标记
"""
from prompts import SYSTEM_PROMPT
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.messages import BaseMessage
from langchain_core.language_models import BaseChatModel
from langchain_huggingface import ChatHuggingFace
from langchain_ollama import ChatOllama, OllamaEmbeddings
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from langchain_huggingface import HuggingFacePipeline
import time, os, logging 
from typing import Iterator

logger = logging.getLogger(__name__)
# logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

# 默认配置
DEFAULT_CONFIG = {
    "vector_store": {
        "persist_directory": "data_db/chroma_db/.hubei_vectdb",
        "collection_name": "local_knowledge",
    },
    "embedding": {
        "type": "huggingface",  # "huggingface" 或 "ollama"  就用huggingface模型
        "huggingface_model": "Qwen/Qwen3-Embedding-0.6B",
        "ollama_model": "nomic-embed-text",
        "ollama_base_url": "http://localhost:11434",
        "device": "cuda" if __import__("os").environ.get("CUDA_VISIBLE_DEVICES") else "cpu",
    },
    "llm": {
        "type": "ollama",  # "huggingface" 或 "ollama"
        "huggingface_model": "Qwen/Qwen3-1.7B",
        "ollama_model": "qwen3:latest",
        "ollama_base_url": "http://localhost:11434",
        "temperature": 0.2,
        "max_new_tokens": 256,
        "context_window": 1000,
    }
}


class RAGAgent:
    def __init__(self, config: dict = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}

        # 初始化嵌入模型
        self.embeddings = self._load_embeddings()

        # 初始化向量数据库
        self.vectordb = self._load_vectorstore()

        # 初始化 LLM
        self.llm = self._load_llm()

        # 初始化提示词
        self.prompt = self._create_prompt()

    def _load_embeddings(self):
        emb_cfg = self.config["embedding"]
        if emb_cfg["type"] == "huggingface":
            logger.info(f"🔧 使用 HuggingFace 嵌入模型: {emb_cfg['huggingface_model']}")
            return HuggingFaceEmbeddings(
                model_name=emb_cfg["huggingface_model"],
                model_kwargs={"device": emb_cfg["device"]}
            )
        elif emb_cfg["type"] == "ollama":
            logger.info(f"🔧 使用 Ollama 嵌入模型: {emb_cfg['ollama_model']}")
            return OllamaEmbeddings(
                model=emb_cfg["ollama_model"],
                base_url=emb_cfg["ollama_base_url"]
            )
        else:
            raise ValueError(f"不支持的嵌入类型: {emb_cfg['type']}")

    def _load_llm(self) -> BaseChatModel:
        llm_cfg = self.config["llm"]
        if llm_cfg["type"] == "huggingface":
            model_name = llm_cfg["huggingface_model"]
            logger.info(f"🔧 使用 HuggingFace LLM: {model_name}")

            tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype="auto",
                device_map="auto",
                trust_remote_code=True
            )
            pipe = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                max_new_tokens=llm_cfg["max_new_tokens"],
                temperature=llm_cfg["temperature"],
                do_sample=True,
                top_p=0.95,
                top_k=9,
                repetition_penalty=1.1,
                return_full_text=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
            )
            hf_pipeline = HuggingFacePipeline(pipeline=pipe)
            return ChatHuggingFace(llm=hf_pipeline, model_id=model_name)

        elif llm_cfg["type"] == "ollama":
            logger.info(f"🔧 使用 Ollama LLM: {llm_cfg['ollama_model']}")
            return ChatOllama(
                base_url=llm_cfg["ollama_base_url"],
                model=llm_cfg["ollama_model"],
                temperature=llm_cfg["temperature"],
                num_ctx=llm_cfg["context_window"],
                num_predict=llm_cfg["max_new_tokens"],
                streaming=True, # 确保启用
                # options={...} 可扩展
            )
        else:
            raise ValueError(f"不支持的 LLM 类型: {llm_cfg['type']}")

    def _load_vectorstore(self) -> Chroma:
        cfg = self.config["vector_store"]
        logger.info(f"📁 加载向量数据库: {cfg['persist_directory']}")
        return Chroma(
            collection_name=cfg["collection_name"],
            embedding_function=self.embeddings,
            persist_directory=cfg["persist_directory"],
        )

    def _create_prompt(self) -> ChatPromptTemplate:
        return ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{question}")
        ])

    def retrieve_context(self, question: str, k: int = 2) -> str:
        """检索相关文档片段"""
        docs = self.vectordb.similarity_search(question, k=k)
        return "\n\n".join(d.page_content for d in docs)

    def _stream_response(self, question: str, k: int = 3, hide_think: bool = True) -> Iterator[str]:
        """
        流式生成回答，可选择是否过滤 <think> 等中间推理标记
        流式生成回答，兼容 Linux/Ubuntu 缓冲问题
        """
        t0 = time.perf_counter()
        context = self.retrieve_context(question, k=k)
        logger.info(f"🔍 检索耗时: {(time.perf_counter() - t0)*1000:.0f} ms")
        logger.debug(f"检索到的上下文: {context}")

        # 构造消息
        messages = self.prompt.format_prompt(question=question, context=context).to_messages()

        first_token_time = None
        if hide_think:
            START_TAG = "</think>"
            MAX_TAG = 10
            ring = ""
            in_answer = False

            for chunk in self.llm.stream(messages):
                content = chunk.content or ""
                if not content:
                    continue

                ring += content
                if len(ring) > MAX_TAG:
                    ring = ring[-MAX_TAG:]

                if not in_answer:
                    idx = ring.lower().find(START_TAG)
                    if idx != -1:
                        post = ring[idx + len(START_TAG):]
                        if post:
                            yield post
                            if first_token_time is None:
                                first_token_time = time.perf_counter()
                        in_answer = True
                        ring = ""
                    continue

                # 已进入回答，正常输出
                if content:
                    if first_token_time is None:
                        first_token_time = time.perf_counter()
                    yield content
        else:
            for chunk in self.llm.stream(messages):
                content = chunk.content or ""
                if content:
                    if first_token_time is None:
                        first_token_time = time.perf_counter()
                    yield content

        total_time = time.perf_counter() - t0
        first_token_latency = (first_token_time - t0) * 1000 if first_token_time else 0
        logger.info(f"⏱️ 首 token 延迟: {first_token_latency:.0f} ms | 总耗时: {total_time*1000:.0f} ms")

    def stream_tokens(self, question: str, k: int = 2, hide_think: bool = True) -> Iterator[str]:
        """对外暴露的流式 token 生成接口"""
        yield from self._stream_response(question, k=k, hide_think=hide_think)