from pypdf import PdfReader

def extract_pubno(pdf_path: str) -> str | None:
    reader = PdfReader(pdf_path)
    text = reader.pages[0].extract_text() or ""
    last_line = text.strip().splitlines()[-1]

    # 去掉空格后匹配
    compact = re.sub(r'\s+', '', last_line.upper())
    m = re.search(r'(CN[A-Z0-9]{9,13})', compact)
    return m.group(0) if m else None

if __name__ == '__main__':
    pdf_p = r"..\docs.log\zhuanli_RobotFeet\CN201721328994.5-一种机器人足端结构.pdf"
    print(extract_pubno(pdf_p))  # None

