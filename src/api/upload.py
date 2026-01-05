from fastapi import APIRouter, UploadFile, File
import uuid
import os

from src.services.document_service import save_document
from src.services.chunk_service import save_chunks
from src.textProcessing import chunking


UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """Receive a document, extract, chunk, and embed it."""
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract + chunk + embed
    text = chunking.extract_text(file_path)
    chunks = chunking.chunk_text(text)
    chunks = chunks[:4]
    refined_json = chunking.process_chunks(chunks)
    # file_path = os.path.join(TEMP_DIR, f"{file_id}_{file.filename}.json")
    
    save_document(file_id, refined_json)
    save_chunks(file_id, chunks)

    return {
        "document_id": file_id,
        "filename": file.filename,
        "chunks": len(chunks),
        "status": "CHUNKED"
    }