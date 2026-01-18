from src.db.mongo import conversations_col, messages_col, serialize_mongo
from datetime import datetime
from bson import ObjectId

def get_all_conversations(dni: str):
    conversations = list(
        conversations_col.find({"user_dni": dni})
        .sort("last_updated", -1)
    )
    return [serialize_mongo(c) for c in conversations]

def get_conversation_messages(conversation_id: str):
    messages = list(
        messages_col.find({
            "conversation_id": ObjectId(conversation_id)
        }).sort("created_at", 1)
    )
    return messages

def create_conversation_service(document_id: str, dni: str):
    conv = {
        "document_id": document_id,
        "user_dni": dni,
        "title": f"Chat sobre documento {document_id}",
        "created_at": datetime.utcnow(),
        "last_updated": datetime.utcnow(),
    }

    result = conversations_col.insert_one(conv)

    return result.inserted_id

def save_message( message: dict):
    messages_col.insert_one(message)