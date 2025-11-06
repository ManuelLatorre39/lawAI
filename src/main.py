from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import os
import uuid
import json
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).resolve().parent
root_root_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=root_dir / ".env")

print("Loaded API key:", os.getenv("GEMINI_API_KEY")[:5], "...")

from src.textProcessing import chunking, embeddings #, search, llm

app = FastAPI(title="Doc Intelligence API")

UPLOAD_DIR = "storage/documents"
TEMP_DIR = "storage/documents-TEMP"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Receive a document, extract, chunk, and embed it."""
    file_id = uuid.uuid4()
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    '''
    # Extract + chunk + embed
    text = chunking.extract_text(file_path)
    chunks = chunking.chunk_text(text)
    chunks = chunks[:4]
    refined_json = chunking.process_chunks(chunks)
    '''
    file_path = os.path.join(TEMP_DIR, f"{file_id}_{file.filename}.json")
    
    '''
    print("Guardando resultado...")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(refined_json, f, ensure_ascii=False, indent=2)
    '''
    
    temp_path = root_root_dir / "storage" / "documents-TEMP" / "6cf5324d-4c93-4cf9-baef-96aac2d9d6a7_example_2.txt.json"
    
    # Load schema JSON
    with open(temp_path, 'r', encoding='utf-8') as f:
        refined_json = json.load(f)
    
    embeddings.embed_and_store(refined_json)

    return {
        "status": "ok", 
        "filename": file.filename, 
        # "chunks": len(chunks)
    }


@app.post("/query")
async def query_docs(query: str = Form(...), top_k: int = Form(5)):
    """Perform semantic search."""
    results = 'test' # search.semantic_search(query, top_k=top_k)
    return {"results": results}

'''
@app.post("/ask")
async def ask_docs(question: str = Form(...)):
    """Ask a natural-language question using retrieval + LLM."""
    context = search.retrieve_relevant_chunks(question)
    answer = llm.answer_question(question, context)
    return {"answer": answer, "context_used": len(context)}
'''
