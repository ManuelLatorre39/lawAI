from src.db.mongo import chunks_col
import ollama

def embed_and_save_chunks(document_id: str, chunks: list[str]):
    docs = []

    for i, text in enumerate(chunks):
        embedding = ollama.embeddings(model="nomic-embed-text", prompt=text)["embedding"]
        docs.append({
            "_id": f"{document_id}_{i:04d}",
            "document_id": document_id,
            "chunk_index": i,
            "text": text,
            "embedding": embedding
        })

    if docs:
        chunks_col.insert_many(docs)