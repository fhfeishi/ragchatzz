from transformers import AutoTokenizer, AutoModelForCausalLM 
from typing import List
import os 
# class HFModelsDownloader_Auto:
#     def __init__(self,models_to_download: List[dict]) -> None:
#         """
#         初始化模型下载器 auto 版本
#         :param models_to_download: 包含模型信息的字典列表，每个字典包含 'model_name' 和 'local_dir' 两个键
#         """
#         self.models_to_download = models_to_download
    
#     def __call__(self):
#         self._load_models()
    
#     def _load_models(self) -> None:
#         for model in self.models_to_download:
#             model_name = model.get("model_name")
#             local_dir = model.get("local_dir", None)
#             if local_dir:
#                 auto_tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=local_dir, trust_remote_code=True)
#             else:
#                 auto_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
#             auto_model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)
#             # 获取实际保存路径
#             save_path = local_dir if local_dir else auto_tokenizer.cache_dir
#             print(f"模型: {model_name} 下载到目录: {save_path} 完成！")
    
    
class HFModelsDownloader_Auto:
    def __init__(self, models_to_download: List[dict]) -> None:
        """
        初始化模型下载器 auto 版本
        :param models_to_download: 包含模型信息的字典列表，每个字典包含 'model_name' 和 'local_dir' 两个键
        特点、可能会中断
        
        - 可以试试 huggingface-cli 
        # 1. 设置镜像源（Linux/macOS）
        export HF_ENDPOINT=https://hf-mirror.com

        # 2. 下载模型（支持断点续传）
        huggingface-cli download --resume-download Qwen/Qwen3-Embedding-0.6B --local-dir ./temp/mineru_models/Qwen3-Embedding-0.6B
        """
        self.models_to_download = models_to_download
    
    def __call__(self):
        self._load_models()
    
    def _load_models(self) -> None:
        for model in self.models_to_download:
            model_name = model.get("model_name")
            local_dir = model.get("local_dir", None)
            
            # 加载模型和tokenizer
            auto_tokenizer = AutoTokenizer.from_pretrained(
                model_name, 
                cache_dir=local_dir, 
                trust_remote_code=True
            )
            auto_model = AutoModelForCausalLM.from_pretrained(
                model_name, 
                cache_dir=local_dir, 
                trust_remote_code=True
            )
            
            # 如果指定了本地目录，显式保存到该目录
            if local_dir:
                os.makedirs(local_dir, exist_ok=True)
                auto_tokenizer.save_pretrained(local_dir)
                auto_model.save_pretrained(local_dir)
                print(f"模型: {model_name} 已保存到目录: {local_dir}")
                # 用户缓存路径下就没有模型文件了
            else:
                print(f"模型: {model_name} 已缓存到: {auto_tokenizer.cache_dir}")




from huggingface_hub import snapshot_download 
class HFModelsDownloader_SnapShot:
    def __init__(self, models_to_download: List[dict]) -> None:
        """
        初始化模型下载器 snapshot 版本
        :param models_to_download: 包含模型信息的字典列表，每个字典包含 'repo_id' 和 'local_dir' 两个键
        """
        self.models_to_download = models_to_download
         
    def __call__(self) -> None:
        self._load_models()
    
    def _load_models(self) -> None:
        for model in self.models_to_download:
            while True:  # 断点续传重试机制
                try:
                    print(f"开始下载模型: {model['repo_id']} 到目录: {model['local_dir']}")
                    snapshot_download(
                        repo_id=model["repo_id"],
                        local_dir=model["local_dir"],
                        resume_download=True,  # 启用断点续传
                        force_download=False,  # 避免重复下载已有文件
                        token=None,            # 如需访问私有模型，替换为你的 token
                    )
                    print(f"模型: {model['repo_id']} 下载到目录: {model['local_dir']} 完成！")
                    break
                except Exception as e:
                    print(f"下载失败: {e}, 重试中...")

if __name__ == '__main__':
    # 设置镜像源（国内加速）、任选其一
    os.environ["HF_ENDPOINT"] = "https://mirrors.tuna.tsinghua.edu.cn/hugging-face/"
    # os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
    
    models_to_download = [
        {
            "model_name": "Qwen/Qwen3-Embedding-0.6B",  # Embedding 模型 bge-m3 Qwen/Qwen3-Embedding-0.6B
            "local_dir": os.path.expanduser("temp/mineru_models/Qwen3-Embedding-0.6B"), # root/model--xxxxx
        }
    ]
    downloader = HFModelsDownloader_Auto(models_to_download)
    downloader()  # 调用下载器






