from src.services.document_service import save_document_analysis
from src.textProcessing.chunking import process_chunks

def generate_and_store_analysis(document_id: str, chunks: list[str]):
    analysis = process_chunks(chunks)
    save_document_analysis(document_id, analysis)
    return analysis