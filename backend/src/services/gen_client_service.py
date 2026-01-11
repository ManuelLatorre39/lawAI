import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

def embed(query: str):
    result = client.models.embed_content(
        model="text-embedding-004",
        contents=query,
    )
    [embedding_obj] = result.embeddings
    return embedding_obj.values

def generate_chat_response(prompt: str):
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )
    
    return response