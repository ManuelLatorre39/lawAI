from src.services.search_service import search_chunks
from src.services.gen_client_service import generate_chat_response

from src.helpers.logger import logger


async def chat_with_document(
    document_id: str,
    prompt: str,
    context: dict,
    config: dict | None = None
):
    # Retrieve relevant chunks
    retrieved_chunks = search_chunks(
        document_id=document_id,
        query=prompt,
        limit=5
    )

    # Build document context string
    doc_context_text = "\n\n".join(
        f"[Página {c.get('page', 'N/A')}] {c['text']}"
        for c in retrieved_chunks
    )

    # Optionally merge user-provided highlights
    highlighted_context = ""
    if context and context.get("highlighted_texts"):
        highlighted_context = "\n\n".join(
            f"[Destacado en doc {h['document_id']}, p.{h.get('page','?')}] {h['text']}"
            for h in context["highlighted_texts"]
        )

    # Build final LLM prompt
    final_prompt = f"""
Eres un asistente legal respondiendo preguntas utilizando el documento provisto.

=== CONTEXTO RECUPERADO AUTOMÁTICAMENTE ===
{doc_context_text}

=== FRAGMENTOS DESTACADOS POR EL USUARIO ===
{highlighted_context if highlighted_context else "(Ninguno)"}

=== CONSULTA DEL USUARIO ===
{prompt}

Instrucciones:
- Responde claramente y en español.
- Cita números de página cuando sea relevante.
- Si no encuentras la información en el documento, dilo explícitamente.
"""

    answer = 'test'

    '''
    # Call LLM (respetando config si existe)
    answer = generate_chat_response(
        final_prompt,
        # temperature=config.get("temperature") if config else None,
        # max_tokens=config.get("max_tokens") if config else None,
        # model=config.get("model") if config else None,
    )
    '''

    # Return answer + structured sources
    return {
        "answer": answer,
        "sources": [
            {
                "chunk_id": str(c["_id"]),
                "page": c.get("page"),
                "text": c.get("text"),
                "score": c.get("score")
            }
            for c in retrieved_chunks
        ]
    }
