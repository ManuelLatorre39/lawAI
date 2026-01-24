from pathlib import Path
from src.textProcessing import chunking
from src.services.chunk_service import embed_and_save_chunks
from src.services.analysis_service import generate_and_store_analysis
from src.services.document_service import update_status, get_document_content
from src.helpers.logger import logger
from bson import ObjectId

def process_document(document_id: str, file_path: Path):
    try:
        update_status(document_id, status_chunks="PROCESSING")

        # 1. Extract text
        pages = chunking.extract_text_with_pages(file_path)

        # 2. Chunk
        chunks = chunking.chunk_pages(pages)

        # 3. Save chunks + embeddings
        embed_and_save_chunks(ObjectId(document_id), chunks)

        # 4. LLM analysis (summary, metadata, etc)
        # Comentado temporalmente: discutir
        # analysis = generate_and_store_analysis(document_id, chunks)

        update_status(document_id, status_chunks="READY")

    except Exception as e:
        update_status(document_id, status_chunks="FAILED")
        raise

async def process_document_content(document_id: str):
    try:
        update_status(document_id, status_chunks="PROCESSING")

        content = get_document_content(document_id)

        logger.info(content)

        if (content is not None):
            pages = [{"page": None, "text": content}]

            # Chunk
            chunks = chunking.chunk_pages(pages)

            # Save chunks + embeddings
            embed_and_save_chunks(document_id, chunks)

            # 4. LLM analysis (summary, metadata, etc)
            # Comentado temporalmente: discutir
            # analysis = generate_and_store_analysis(document_id, chunks)

            update_status(document_id, status_chunks="READY")
        else:
            update_status(document_id, status_chunks="NONE")

    except Exception as e:
        update_status(document_id, status_chunks="FAILED")
        raise
