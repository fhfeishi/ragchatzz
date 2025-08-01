import re, tiktoken 
from utils import get_text, num_tokens_from_string 

def num_tokens_from_string(string: str) -> int:
    """Returns the number of tokens in a text string."""
    encoder = tiktoken.get_encoding("cl100k_base")   # embedding-model: Qwen/Qwen3-Embedding-0.6B
    try:
        return len(encoder.encode(string))
    except Exception:
        return 0


class TxtParser:
    def __call__(self, fnm, binary=None, chunk_token_num=128, delimiter="\n!?;。；！？"):
        txt = get_text(fnm, binary)
        return self.parser_txt(txt, chunk_token_num, delimiter)
    
    @classmethod
    def parser_txt(cls, txt, chunk_token_num=128, delimiter="\n!?;。；！？"):
        if not isinstance(txt, str):
            raise TypeError("txt type should be str!!")
        cks = [""]
        tk_nums = [0]
        delimiter = delimiter.encode('utf-8').decode('unicode_escape').encode('latin1').decode('utf-8')
        
        def add_chunk(t):
            nonlocal cks, tk_nums, delimiter
            tnum = num_tokens_from_string(t)
            if tk_nums[-1] > chunk_token_num:
                cks.append(t)
                tk_nums.append(tnum)
            else:
                cks[-1] += t 
                tk_nums[-1] += tnum 
        
        dels = []
        s = 0 
        for m in re.finditer(r"`([^`]+)`", delimiter, re.I):
            f, t = m.span()
            dels.append(m.group(1))
            dels.extend(list(delimiter[s:f]))
            s = t 
        if s < len(delimiter):
            dels.extend(list(delimiter[s:]))
        dels = [re.escape(d) for d in dels if d]
        dels = [d for d in dels if d]
        dels = "|".join(dels)
        secs = re.split(r"(%s)" % dels, txt)
        for sec in secs:
            if re.match(f"^{dels}$", sec):
                continue 
            add_chunk(sec)
        return [[c, ""] for c in cks]
            
                
                
            



