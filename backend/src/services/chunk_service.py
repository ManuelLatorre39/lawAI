from src.db.mongo import chunks_col
import ollama
import os
from dotenv import load_dotenv
from google import genai

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


def embed_and_save_chunks(document_id: str, chunks: list[dict]):
    docs = []

    for i, chunk in enumerate(chunks):
        text = chunk["text"]
        page = chunk["page"]

        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text,
        )
        [embedding_obj] = result.embeddings
        embeddings = embedding_obj.values

        docs.append({
            "_id": f"{document_id}_{i:04d}",
            "document_id": document_id,
            "chunk_index": i,
            "page": page,
            "text": text,
            "embedding": embeddings
        })

    if docs:
        chunks_col.insert_many(docs)