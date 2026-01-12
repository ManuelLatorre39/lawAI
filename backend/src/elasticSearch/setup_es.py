# setup_es.py
# Migrated from sentence-transformers to Gemini embeddings
import os
from elasticsearch import Elasticsearch
from google import genai
from dotenv import load_dotenv

load_dotenv()

# 1. Connect
es = Elasticsearch("http://localhost:9200")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 2. Create index if not exists (dims: 768 for Gemini text-embedding-004)
INDEX_NAME = "legal_documents"
if not es.indices.exists(index=INDEX_NAME):
    es.indices.create(
        index=INDEX_NAME,
        mappings={
            "properties": {
                "texto": {"type": "text"},
                "embedding": {"type": "dense_vector", "dims": 768},
                "metadata": {"type": "object"},
            }
        },
    )
    print("Created index:", INDEX_NAME)

# 3. Generate embedding with Gemini
text = "La actora solicita la tenencia exclusiva de sus hijos menores..."
embedding = client.models.embed_content(
    model="text-embedding-004",
    contents=text,
).embeddings[0].values

# 4. Insert doc
doc = {
    "texto": text,
    "embedding": embedding,
    "metadata": {"expediente": "12345/2022"},
}
es.index(index=INDEX_NAME, document=doc)
print("Inserted document!")

# 5. Semantic search
query = "tenencia"
query_vec = client.models.embed_content(
    model="text-embedding-004",
    contents=query,
).embeddings[0].values

res = es.search(
    index=INDEX_NAME,
    body={
        "knn": {
            "field": "embedding",
            "query_vector": query_vec,
            "k": 3,
            "num_candidates": 50
        },
        "_source": ["texto", "metadata"]
    }
)

print("\nResults:")
for hit in res["hits"]["hits"]:
    print(f"- {hit['_source']['texto']} (score={hit['_score']:.4f})")
