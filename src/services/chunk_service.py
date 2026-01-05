from src.db.mongo import chunks_col

def save_chunks(document_id: str, chunks: list[str]):
    docs = []

    for i, text in enumerate(chunks):
        docs.append({
            "_id": f"{document_id}_{i:04d}",
            "document_id": document_id,
            "chunk_index": i,
            "text": text,
            "embedding": None
        })

    if docs:
        chunks_col.insert_many(docs)
