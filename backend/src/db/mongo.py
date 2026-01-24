from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)

db = client["lawai"]

documents_col = db["documents"]
chunks_col = db["document_chunks"]
analysis_col = db["analysis"]
content_col = db["content"]
users_col = db["users"]
sessions_col = db["sessions"]
messages_col = db["messages"]

def serialize_mongo(doc):
    doc["_id"] = str(doc["_id"])
    return doc

def init_indexes():
    content_col.create_index(
        [("document_id", 1)],
        unique=True
    )

    analysis_col.create_index(
        [("document_id", 1), ("kind", 1)],
        unique=True
    )

    chunks_col.create_index(
        [("document_id", 1)]
    )

    """
    chunks_col.create_index(
        [("embedding", "cosine")]  # if using vector search later
    )
    """
    
init_indexes()