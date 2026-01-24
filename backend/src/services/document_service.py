from src.db.mongo import documents_col, analysis_col, chunks_col, content_col
from datetime import datetime, timezone
from typing import List, Optional
import math
import os
from dotenv import load_dotenv
from google import genai
from fastapi import HTTPException
from pathlib import Path
from src.helpers.datetime import now
from src.helpers.logger import logger
from bson import ObjectId

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

UPLOAD_DIR = Path("storage/uploads")

def get_all_documents():
    docs = documents_col.find(
        {},
        {
            "_id": 1,
            # "filename": 1,
            "status_chunks": 1,
            "status_analysis": 1,
            "created_at": 1,
            "updated_at": 1,
        },
    )

    return [serialize_document(doc) for doc in docs]

def get_documents_by_chunks(chunks: list):
    if not chunks:
        return []

    document_ids = list({
        c["document_id"] for c in chunks if c.get("document_id")
    })

    docs = documents_col.find(
        {"_id": {"$in": document_ids}},
        {
            "_id": 1,
            "filename": 1,
            "status": 1,
            "created_at": 1,
            "updated_at": 1,
        },
    )

    return [serialize_document(doc) for doc in docs]

def get_document_content(doc_id: str):
    content = content_col.find_one(
        {"document_id": ObjectId(doc_id)},
        {
            "_id": 1,
            "document_id": 1,
            "full_text": 1
        },
    )
    
    result = None
    
    if content:
        result = content["full_text"]
    
    return result

def get_document_analysis(doc_id: str):
    analysis = analysis_col.find_one(
        {"document_id": ObjectId(doc_id)},
    )
    
    return serialize_doc_id(analysis)

def get_document_by_id(doc_id: str):
    doc = documents_col.find_one(
        {"_id": ObjectId(doc_id)},
    )
    logger.info(doc)
    
    return serialize_doc_id(doc)

def save_document(file_id: str, filename: str):
    doc = {
        "guid": None,  # use guid as stable ID
        "filename": filename,
        "file_path": f"{file_id}_{filename}",
        "source_type": "saij",
        "source_id": None,
        "title": None,
        "visibility": "public",
        "status_chunks": "PENDING",
        "status_analysis": "PENDING",
        "created_at": now(),
        "updated_at": now()
    }
    
    documents_col.insert_one(doc)
    
def save_document_analysis(document_id: str, analysis: dict):
    analysis_col.insert_one({
        "_id": document_id,
        "analysis": analysis,
        "created_at": datetime.utcnow()
    })
    
def update_status(
    document_id: str,
    status_chunks: Optional[str] = None,
    status_analysis: Optional[str] = None,
):
    update_fields = {
        "updated_at": datetime.now(timezone.utc)
    }

    if status_chunks is not None:
        update_fields["status_chunks"] = status_chunks

    if status_analysis is not None:
        update_fields["status_analysis"] = status_analysis

    if len(update_fields) == 1:
        # Only updated_at → nothing meaningful to update
        return

    documents_col.update_one(
        {"_id": document_id},
        {"$set": update_fields}
    )
    
def serialize_document(doc):
    return {
        "id": str(doc["_id"]),
        # "filename": doc["filename"],
        "status_chunks": doc["status_chunks"],
        "status_analysis": doc["status_analysis"],
        "created_at": (
            doc["created_at"]
            .replace(tzinfo=timezone.utc)
            .isoformat()
            if doc.get("created_at")
            else None
        ),
        "updated_at": (
            doc["updated_at"]
            .replace(tzinfo=timezone.utc)
            .isoformat()
            if doc.get("updated_at")
            else None
        ),
    }

def serialize_doc_id(doc):
    if not doc:
        return None
    # stringify _id
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])

    # stringify document_id if present
    if "document_id" in doc and isinstance(doc["document_id"], ObjectId):
        doc["document_id"] = str(doc["document_id"])

    return doc

def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    return dot / (norm_a * norm_b)

def search_documents(query: str, top_k: int = 5):
    """
    Semantic search over document chunks.
    Returns grouped results by document.
    """

    # Embed query
    '''
    query_embedding = ollama.embeddings(
        model="nomic-embed-text",
        prompt=query
    )["embedding"]
    '''
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=query,
    )
    [embedding_obj] = result.embeddings
    embeddings = embedding_obj.values


    # Fetch candidate chunks
    # (simple approach: brute force, OK for MVP)
    chunks = list(chunks_col.find({}, {
        "embedding": 1,
        "text": 1,
        "document_id": 1,
        "chunk_id": 1,
        "page": 1
    }))

    # Score chunks
    scored = []
    for chunk in chunks:
        score = cosine_similarity(embeddings, chunk["embedding"])
        scored.append({
            "document_id": chunk["document_id"],
            "chunk_id": chunk["_id"],
            "text": chunk["text"],
            "page": chunk["page"],
            "score": score
        })

    # Sort + take top K
    top_chunks = sorted(scored, key=lambda x: x["score"], reverse=True)[:top_k]

    # Group by document
    results = {}
    for c in top_chunks:
        doc_id = c["document_id"]

        if doc_id not in results:
            doc = documents_col.find_one(
                {"_id": doc_id},
                {"filename": 1, "status": 1}
            )
            results[doc_id] = {
                "document_id": doc_id,
                "filename": doc.get("filename") if doc else None,
                "matches": []
            }

        results[doc_id]["matches"].append({
            "chunk_id": c["chunk_id"],
            "text": c["text"],
            "page": c["page"],
            "score": round(c["score"], 4)
        })

    return list(results.values())

def get_document_file_path(document_id: str) -> Path:
    doc = documents_col.find_one({"_id": ObjectId(document_id)})
    if not doc:
        # raise HTTPException(status_code=404, detail="Document not found")
        return None

    file_path = doc.get("file_path")
    if not file_path:
        # raise HTTPException(status_code=404, detail="File path not found")
        return None

    file_path_full = UPLOAD_DIR / file_path
    print(file_path_full)

    if not file_path_full.exists():
        # raise HTTPException(status_code=404, detail="File not found on disk")
        return None

    return file_path_full
