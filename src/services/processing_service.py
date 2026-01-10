from pathlib import Path
from src.textProcessing import chunking
from src.services.chunk_service import embed_and_save_chunks
from src.services.analysis_service import generate_and_store_analysis
from src.services.document_service import update_status

def process_document(document_id: str, file_path: Path):
    try:
        update_status(document_id, "PROCESSING")

        # 1. Extract text
        pages = chunking.extract_text_with_pages(file_path)

        # 2. Chunk
        chunks = chunking.chunk_pages(pages)

        # 3. Save chunks + embeddings
        embed_and_save_chunks(document_id, chunks)

        # 4. LLM analysis (summary, metadata, etc)
        analysis = generate_and_store_analysis(document_id, chunks)

        update_status(document_id, "READY")

    except Exception as e:
        update_status(document_id, "FAILED")
        raise
