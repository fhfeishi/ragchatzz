from collections import OrderedDict
import os, re
from pathlib import Path
from pypdf import PdfReader
from langchain_core.documents import Document
from typing import List, Dict 

class zhuanli_parser:
    def __init__(self, markdown_file: str):
        self.markdown_file = markdown_file
        self.ims_dir = Path(markdown_file).parent / "images"
        self.meta_schema = OrderedDict({
            "pubno": str,
            "patent_name": str,
            "applier": str,
            "inventor": str,
            "apply_time": str,
            "root_dir": str(Path(markdown_file).parent.absolute()),
            "fig_list": dict,   # {"图1": ["描述", "绝对路径"]}
        }) # 申请公布号 专利名称 申请人 发明人 申请时间 配图{"图1": [str(description),str(path/to/1.jpg)], }, 路径
    
    def __call__(self):
        return self.pipeline()  
    
    def _load_md_text(self) -> str:
        md_text = Path(self.markdown_file).read_text(encoding='utf-8')
        return md_text
    
    def _extract_imMatadata(self, content: str) -> dict:
        """  
        返回形如 {"fig_list": {"图1":[desc,abs_path], ...}}
        若无附图章节，返回 {"fig_list": {"图1": ["描述文本", "绝对路径"], ...}}
        """      

        """ 从markdown文本中提取图片元数据 """
        # 1 提取“附图说明”标题及其内容（直到下一个标题或文件结尾） 
        # # 之后的全部文本， 因为图片路径在最后呢
        pattern = re.compile(
            r'^(#{1,3})\s*附图说明\s*\n+\s*([\s\S]*?)(?=^#{1,3}|\Z)',  # 附图说明  --> 。
            re.MULTILINE)
        # pattern = re.compile(
        #     r'^(#{1,3})\s*附图说明\s*\n.*?(?<=\。)',  # 非贪婪到第一个“。”并包含它
        #     re.MULTILINE | re.DOTALL)
        match = pattern.search(content)
        if not match:
            print(f"⚠️ markdown file {os.path.basename(self.markdown_file)} 未找到 '附图说明' 章节，跳过处理。")
            return {"fig_list": {}}

        body = match.group(0)                    # 整个段落
        # 2 建立 图号 -> 相对路径 映射（全局）
        img_map: Dict[str, str] = {
            f"图{num}": path.strip()
            for path, num in re.findall(
                r'!\[.*?\]\((.*?)\)\s*\n?\s*图(\d+)', content, flags=re.I
            )
        }
        # print(img_map)  # ok
        
        # img_blocks = re.findall(r'!\[.*?\]\((.*?)\)\s*\n\s*图(\d+)', content, re.IGNORECASE)
        # for path, num in img_blocks:
        #     img_map[f"图{num}"] = path.strip()
            
        # 3. 在段落内逐行提取  图X是YYY；
        fig_dict: Dict[str, list] = {}
        for line in body.splitlines():
            # 支持 [0050] 图1是...；  或  图1是...；
            # m = re.search(r'图(\d+)[：:\s]*(.*?)[；;。]', line.strip())
            m = re.search(r'图(\d+)是(.*?)[，；:：,.;。]', line.strip())
            if not m:
                continue
            num, desc = m.groups()
            # print(num, desc)  # ok  
            key = f"图{num}"
            rel_path = img_map.get(key)
            # print(rel_path)  # None
            if rel_path:
                abs_path = str((Path(self.markdown_file).parent / rel_path).resolve())
                if Path(abs_path).exists():
                    fig_dict[key] = [desc.strip(), abs_path]
                else:
                    print(f"⚠️ 图片不存在：{abs_path}")
        return {"fig_list": fig_dict}
       
    def _extract_abstract_im(self, markdown_text: str) -> tuple[str, list]:
        """
        摘要图  处理   --待定
        返回：
            cleaned_abstract  -> 去掉图片标记后的摘要纯文本 (不要也行把)
            meta_patch        -> {"abs_im": ["摘要配图", abs_path]}
        """
        # 1. 抓 (57)摘要 整块
        m = re.search(
            r'^(#{1,3})\s*\(57\)摘要\s*\n(.*?)(?=^#{1,3}|\Z)',
            markdown_text, flags=re.M | re.S
        )
        if not m:
            return "", {"fig_list": {"abs_im": None}}

        abstract_block = m.group(2)

        # 2. 提取图片路径
        img_m = re.search(r'!\[.*?\]\((.*?)\)', abstract_block)
        if not img_m:
            return abstract_block.strip(), {"fig_list": {"abs_im": None}}

        rel_path = img_m.group(1).strip()
        abs_path = str((Path(self.markdown_file).parent / rel_path).resolve())

        # 3. 去掉图片行（整行删除，包括换行）
        cleaned = re.sub(r'!\[.*?\]\(.*?\)\s*\n?', '', abstract_block).strip()

        return cleaned, {"fig_list": {"abs_im": ["摘要配图", abs_path]}}
        
    def _extract_meta_blocks(self, text: str) -> dict[str, str]:
        """ 从专利text中提取 专利名称 申请日 申请人 发明人 """
        # 1. 取实用新型名称
        name = re.search(r'(?m)^#\s*\(54\)\s*实用新型名称\s*\n(.+)', text)
        patent_name = name.group(1).strip() if name else ""

        # 2. 其余字段用分组捕获
        m = re.search(
            r'\(22\)申请日\s*([^\s\n]+).*?'      # 申请日
            r'\(73\)专利权人\s*([^\s\n]+).*?'    # 申请人（只保留名称，忽略地址）
            r'\(72\)发明人\s*([^\s\n]+)',        # 发明人
            text, flags=re.S
        )
        if not m:
            return {"patent_name": patent_name,
                    "apply_time": "", "applier": "", "inventor": ""}

        apply_time, applier, inventor = m.groups()
        return {
            "patent_name": patent_name,
            "apply_time": apply_time.strip(),
            "applier": applier.strip(),
            "inventor": inventor.strip()
        }
    
    def _extract_pubno(self) -> dict[str, str]:
        # 专利pdf第一页最后一行 -> 申请公告号
        pdfp = str(self.markdown_file)[:-3] + "_origin.pdf"
        reader = PdfReader(pdfp)
        text_1 = reader.pages[0].extract_text() or ""
        last_line = text_1.strip().splitlines()[-1]

        # 去掉空格后匹配
        compact = re.sub(r'\s+', '', last_line.upper())
        m = re.search(r'(CN[A-Z0-9]{9,13})', compact)
        if m:
            pubno_str = m.group(0)
            return {"pubno": pubno_str}
        else:
            raise ValueError(f"专利 {os.path.basename(pdfp)} 未找到 申请公告号 的字符串")    
        
    def _filter_endsl(self, langchain_md_text: str) -> str:
        """ 删除文末所有“图片 + 图X”块（连续出现在末尾的） """
        new_text = re.sub(
            r'(\n\s*!\[.*?\]\([^)]+\)\s*\n\s*图\d+\s*)+$',
            '',
            langchain_md_text,
            flags=re.MULTILINE | re.IGNORECASE
        ).rstrip() + '\n'
        return new_text
    
    def _filter_lines(self, langchain_md_text: str) -> str:
        """
        删除所有
            ![...](...)
            图X...
        这种成对出现的块（支持中间有空行）。
        返回净化后的文本。   例外  摘要图： ![...](...)
        """
        # (?s) 让 . 匹配换行
        pattern = re.compile(
            r'!\[.*?\]\([^)]*\)[ \t]*(?:\n[ \t]*)*\n?[ \t]*图\d+[：:\s]*[^\n]*(?:\n|$)',
            flags=re.IGNORECASE | re.MULTILINE
        )
        return pattern.sub('', langchain_md_text)
        
        
    

    def pipeline(self) -> Document:
        md_text = self._load_md_text()
        # 获取 图片 元数据  -> 
        fig_lists = self._extract_imMatadata(md_text) 
        # 过滤掉原markdown中 嵌入图片的文本 ![](...)
        md_text_filtered = self._filter_lines(md_text)
        loaded_docs = Document(page_content=md_text_filtered, metadata={})
        # 获取 申请公告号 元数据 -> 
        pubno = self._extract_pubno()
        meta_blocks = self._extract_meta_blocks(md_text_filtered)
        self.meta_schema.update(fig_lists)
        self.meta_schema.update(meta_blocks)
        self.meta_schema.update(pubno)
        
        # 同步更新到 Document元数据
        loaded_docs.metadata.update(**self.meta_schema)
        
        # self.meta_schema
        # meta_schema = OrderedDict({
        #     "pubno": str,
        #     "patent_name": str,
        #     "applier": str,
        #     "inventor": str,
        #     "apply_time": str,
        #     "root_dir": Path(markdown_file).parent,
        #     "fig_list": dict,   # {"图1": ["描述", "绝对路径"]}
        # }) # 申请公布号 专利名称 申请人 发明人 申请时间 配图{"图1": [str(description),str(path/to/1.jpg)], }, 路径
        # print(self.meta_schema)
        # loaded_docs.metadata = self.meta_schema
        # 
        return loaded_docs
        


if __name__ == '__main__':
    markdown_file = r".\docs.log\zhuanli_RobotHand\CN202021894937.5-一种结构紧凑的回转动力单元以及应用其的机器人\auto\CN202021894937.5-一种结构紧凑的回转动力单元以及应用其的机器人.md"
    
    pdf_filr = r"D:\ddesktop\agentdemos\ragchatzz\docs.log\zhuanli_RobotHand\CN202510087248.4-一种机器人灵巧手\auto\CN202510087248.4-一种机器人灵巧手.md"
    
    zhuanli = zhuanli_parser(markdown_file=markdown_file)
    # print(zhuanli._extract_pubno())
    
    loaded_docs = zhuanli()
    print(loaded_docs.metadata)