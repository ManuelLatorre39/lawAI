from src.db.mongo import sessions_col, messages_col, serialize_mongo
from datetime import datetime
from bson import ObjectId

def get_all_sessions(dni: str):
    sessions = list(
        sessions_col.find({"user_dni": dni})
        .sort("last_updated", -1)
    )
    return [serialize_mongo(c) for c in sessions]

def get_session_messages(session_id: str):
    messages = list(
        messages_col.find({
            "conversation_id": ObjectId(session_id)
        }).sort("created_at", 1)
    )
    return messages

def create_session_service(document_id: str, dni: str):
    conv = {
        "document_id": document_id,
        "user_dni": dni,
        "title": f"Chat sobre documento {document_id}",
        "created_at": datetime.utcnow(),
        "last_updated": datetime.utcnow(),
    }

    result = sessions_col.insert_one(conv)

    return result.inserted_id

def save_message( message: dict):
    result = messages_col.insert_one(message.copy())
    return str(result.inserted_id)