import os
from google import genai
from dotenv import load_dotenv
import json
from elasticsearch import Elasticsearch
from pathlib import Path
import ollama

'''
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
'''

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def embed_and_store(refined_json_dict):
    
    base_dir = Path(__file__).parent.parent

    # Build paths safely
    schema_path = base_dir / "elasticSearch" / "lawai_mapping.json"
    
    with open(schema_path) as f:
        lawai_mapping = json.load(f)
        
    es = Elasticsearch("http://localhost:9200")

    index_name = "lawai_legal_docs"
    
    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name, body=lawai_mapping["mapping"])
        print(f"Index '{index_name}' created successfully!")
    else:
        print("Index already exists.")
        
    full_text = refined_json_dict["content"]["full_text"]

    # embedding = ollama.embeddings(model="nomic-embed-text", prompt=full_text)["embedding"]
    embedding = client.models.embed_content(
        model="text-embedding-004",
        contents=full_text,
    ).embeddings

    # 3. store in JSON
    refined_json_dict.setdefault("analysis", {})
    refined_json_dict["analysis"]["embeddings"] = embedding
    
    # Index (insert) the document
    es.index(
        index=index_name, 
        id=refined_json_dict["document_id"], 
        document=refined_json_dict
    )
    
    print("Document indexed successfully!")
    
def embed_query(query):
    # query_embedding = ollama.embeddings(model="nomic-embed-text", prompt=query)["embedding"]
    query_embedding = client.models.embed_content(
        model="text-embedding-004",
        contents=query,
    ).embeddings
    
    return query_embedding