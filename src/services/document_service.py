from src.db.mongo import documents_col, analysis_col
from datetime import datetime, timezone

def get_all_documents():
    # Return raw Mongo documents
    return list(documents_col.find({}, {"_id": 1, "filename": 1, "status": 1, "created_at": 1, "updated_at": 1}))

def save_document(document_id: str, filename: str):
    documents_col.insert_one({
        "_id": document_id,
        "filename": filename,
        "status": "UPLOADED",
        "created_at": datetime.utcnow()
    })
    
def save_document_analysis(document_id: str, analysis: dict):
    analysis_col.insert_one({
        "_id": document_id,
        "analysis": analysis,
        "created_at": datetime.utcnow()
    })
    
def update_status(document_id: str, status: str):
    documents_col.update_one(
        {"_id": document_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )