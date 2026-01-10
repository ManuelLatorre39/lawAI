from src.db.mongo import documents_col, analysis_col, chunks_col
from datetime import datetime, timezone
from typing import List
import ollama
import math
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

def get_all_documents():
    docs = documents_col.find(
        {},
        {
            "_id": 1,
            "filename": 1,
            "status": 1,
            "created_at": 1,
            "updated_at": 1,
        },
    )

    return [serialize_document(doc) for doc in docs]

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
    
def serialize_document(doc):
    return {
        "id": str(doc["_id"]),
        "filename": doc["filename"],
        "status": doc["status"],
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
        "chunk_id": 1
    }))

    # Score chunks
    scored = []
    for chunk in chunks:
        score = cosine_similarity(embeddings, chunk["embedding"])
        scored.append({
            "document_id": chunk["document_id"],
            "chunk_id": chunk["_id"],
            "text": chunk["text"],
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
            "score": round(c["score"], 4)
        })

    return list(results.values())