# setup_es.py
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

# 1. Connect
es = Elasticsearch("http://localhost:9200")

# 2. Create index if not exists
INDEX_NAME = "legal_documents"
if not es.indices.exists(index=INDEX_NAME):
    es.indices.create(
        index=INDEX_NAME,
        mappings={
            "properties": {
                "texto": {"type": "text"},
                "embedding": {"type": "dense_vector", "dims": 384},
                "metadata": {"type": "object"},
            }
        },
    )
    print("Created index:", INDEX_NAME)

# 3. Generate embedding
model = SentenceTransformer("all-MiniLM-L6-v2")
text = "La actora solicita la tenencia exclusiva de sus hijos menores..."
embedding = model.encode(text)

# 4. Insert doc
doc = {
    "texto": text,
    "embedding": embedding.tolist(),
    "metadata": {"expediente": "12345/2022"},
}
es.index(index=INDEX_NAME, document=doc)
print("Inserted document!")

# 5. Semantic search
query = "tenencia"
query_vec = model.encode(query)

res = es.search(
    index=INDEX_NAME,
    body={
        "knn": {
            "field": "embedding",
            "query_vector": query_vec.tolist(),
            "k": 3,
            "num_candidates": 50
        },
        "_source": ["texto", "metadata"]
    }
)

print("\nResults:")
for hit in res["hits"]["hits"]:
    print(f"- {hit['_source']['texto']} (score={hit['_score']:.4f})")
