from src.db.mongo import documents_col
from datetime import datetime

def save_document(document_id: str, filename: str):
    documents_col.insert_one({
        "_id": document_id,
        "filename": filename,
        "status": "UPLOADED",
        "created_at": datetime.utcnow()
    })