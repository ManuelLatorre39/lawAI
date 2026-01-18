from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import FileResponse
import uuid
import os
from pathlib import Path

from src.services.document_service import save_document, get_all_documents, search_documents, get_document_file_path
from src.services.processing_service import process_document

UPLOAD_DIR = Path("storage/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/documents", tags=["upload"])

@router.get("")
def get_documents():
    return get_all_documents()

@router.get("/search")
def search(
    q: str = Query(..., min_length=3),
    top_k: int = 5
):
    return {
        "query": q,
        "results": search_documents(q, top_k)
    }

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
    ):
    """Receive a document."""
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    save_document(file_id, file.filename)
    # save_chunks(file_id, chunks) cambiar a procesamiento posterior

    background_tasks.add_task(
        process_document,
        file_id,
        file_path
    )

    return {
        "document_id": file_id,
        "filename": file.filename,
        # "chunks": len(chunks),
        "status": "UPLOADED"
    }
    
@router.get("/{document_id}/file")
def get_document_file(document_id: str):
    file_path = get_document_file_path(document_id)

    return FileResponse(
        path=file_path,
        media_type="application/pdf"
        # filename=file_path.name,
        # media_type="application/octet-stream"
    )
