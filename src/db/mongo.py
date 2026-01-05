from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)

db = client["lawai"]

documents_col = db["documents"]
chunks_col = db["document_chunks"]
analysis_col = db["document_analysis"]