from src.services.search_service import search_chunks, search_chunks_global
from src.services.gen_client_service import generate_chat_response
from src.services.chunk_service import get_chunks
from src.services.document_service import get_documents_by_chunks

from src.helpers.logger import logger

def handle_chunk_search(
    document_id: str,
    prompt: str, 
    context: dict
) -> dict:
    
    # Retrieve relevant chunks (based on prompt)
    retrieved_chunks = search_chunks(
        document_id=document_id,
        query=prompt,
        limit=5
    )
    
    selected_chunks = []
    
    # Retrieve selected chunks
    if(context and context["chunks_ids"]):
        selected_chunks = get_chunks(context["chunks_ids"])
        selected_ids = {c["chunk_id"] for c in selected_chunks}
        retrieved_chunks = [
            c for c in retrieved_chunks
            if c["chunk_id"] not in selected_ids
        ]

    sections = []

    if retrieved_chunks:
        # Build document context string
        retrieved_text = "\n\n".join(
            f"[Página {c.get('page', 'N/A')}] {c['text']}"
            for c in retrieved_chunks
        )
        sections.append(
            "=== CONTEXTO RECUPERADO AUTOMÁTICAMENTE ===\n" + retrieved_text
        )
        
    if selected_chunks:
        selected_text = "\n\n".join(
            f"[Página {c.get('page', 'N/A')}] {c['text']}"
            for c in selected_chunks
        )

        sections.append(
            "=== TEXTO SELECCIONADO POR EL USUARIO ===\n" + selected_text
        )
    return {"sections": sections, "chunks": selected_chunks + retrieved_chunks}


def handle_doc_search_global(
    prompt: str,
    chunks: list,
    context: dict
) -> dict:
    embedding_input = prompt

    if chunks:
        chunks_text = " ".join(c['text'] for c in chunks)
        embedding_input += " " + chunks_text

    if context and context.get("highlighted_texts"):
        highlights_text = " ".join(h["text"] for h in context["highlighted_texts"])
        embedding_input += " " + highlights_text
        
    chunks_global = search_chunks_global(embedding_input)
    
    docs_similar = get_documents_by_chunks(chunks_global)
    
    return docs_similar
    

async def chat_with_document(
    document_id: str,
    prompt: str,
    context: dict,
    config: dict | None = None
):

    result = handle_chunk_search(document_id, prompt, context)
    doc_context_text = "\n\n".join(result["sections"])

    recommended_docs = handle_doc_search_global(prompt, result["chunks"], context)

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

    logger.info(final_prompt)

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
            for c in result["chunks"]
        ],
        "similar_docs": recommended_docs
    }
