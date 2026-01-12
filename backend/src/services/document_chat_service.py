from src.services.search_service import search_chunks
from src.services.gen_client_service import generate_chat_response

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def chat_with_document(document_id: str, user_message: str):
    # 1. Retrieve relevant chunks
    chunks = search_chunks(
        document_id=document_id,
        query=user_message,
        limit=5
    )

    # 2. Build context
    context = "\n\n".join(
        f"[Page {c['page']}] {c['text']}"
        for c in chunks
    )

    # 3. LLM prompt
    prompt = f"""
        Eres un asistente legal respondiendo preguntas utilizando el documento provisto

        CONTEXTO DE DOCUMENTO:
        {context}

        CONSULTA:
        {user_message}

        Responde claramente y cita números de página si es relevante.
        Responder en español.
    """

    # 4. Call LLM
    answer = generate_chat_response(prompt)

    return {
        "answer": answer,
        "sources": [
            {
                "chunk_id": c["_id"],
                "page": c.get("page"),
                "score": c["score"]
            }
            for c in chunks
        ]
    }
