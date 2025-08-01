# backend/src.py
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
import subprocess, os 

app = FastAPI()
OUTPUT_DIR = r"./docs.log/output"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    file_path = f"./logs.doc/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    subprocess.run([
        "magic-pdf","-p", file_path, "-o",OUTPUT_DIR
        ])
    return {"message": "PDF parsed successfully"}


