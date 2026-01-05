from fastapi import APIRouter, UploadFile, File, BackgroundTasks
import uuid
import os

from src.services.document_service import save_document
from src.services.processing_service import process_document

UPLOAD_DIR = "storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
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