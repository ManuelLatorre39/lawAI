from src.db.mongo import chunks_col
from src.services.gen_client_service import embed
from src.services.document_service import cosine_similarity

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MIN_SIMILARITY = 0.55

def search_chunks(document_id: str, query: str, limit=5):
    query_embedding = embed(query)

    candidates = chunks_col.find({"document_id": document_id}, {
        "text": 1,
        "embedding": 1,
        "document_id": 1,
        "page": 1
    })

    scored = []
    for doc in candidates:
        score = cosine_similarity(query_embedding, doc["embedding"])
        if(score >= MIN_SIMILARITY): 
            scored.append({**doc, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)

    if(len(scored) > 0):
        top_scores = [c["score"] for c in scored[:limit]]
        avg_score = sum(top_scores) / len(top_scores)

        if avg_score < 0.55:
            return []  

    return scored[:limit]

def search_chunks_global(query: str, limit=5):
    query_embedding = embed(query)

    candidates = chunks_col.find({}, {
        "text": 1,
        "embedding": 1,
        "document_id": 1,
        "page": 1
    }).limit(2000)

    scored = []
    for doc in candidates:
        score = cosine_similarity(query_embedding, doc["embedding"])
        if(score >= MIN_SIMILARITY): 
            scored.append({**doc, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)
    
    if(len(scored) > 0):
        top_scores = [c["score"] for c in scored[:limit]]
        avg_score = sum(top_scores) / len(top_scores)

        if avg_score < 0.55:
            return []  
    
    return scored[:limit]