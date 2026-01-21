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
    
def check_answerability(context: str, prompt: str):
    final_prompt = f"""
    Dado el siguiente contexto extraído de documentos legales:

    === CONTEXTO ===
    {context}

    === PREGUNTA ===
    {prompt}

    ¿El contexto contiene información suficiente para responder la pregunta?
    Responde únicamente con "SI" o "NO".
    """
    
    answer = generate_chat_response(
        final_prompt
    )
    logger.info(answer)
    
    return answer.strip().upper() == "SI"

def check_domain_related(prompt: str):
    # ¿Está relacionada con documentos legales, normativas, contratos o jurisprudencia?
    final_prompt = f"""
    Clasifica la pregunta del usuario: {prompt}.
    ¿Podría ser clasificada como una pregunta totalmente irrelevante y no relacionada al ámbito legal?
    Solo clasificar como NO_RELACIONADA en el caso de que sea de otro tema totalmente distinto, de forma obvia.
    En el caso de no estar seguro, clasificar como RELACIONADA, ya que puede estar relacionada al contexto.

    Responde: RELACIONADA / NO_RELACIONADA
    """
    answer = generate_chat_response(
        final_prompt
    )
    logger.info(answer)
    
    return answer.strip().upper() == "RELACIONADA"

async def chat_with_document(
    document_id: str,
    prompt: str,
    context: dict,
    config: dict | None = None
):
    is_domain_related = check_domain_related(prompt)
    if (not is_domain_related):
        return {
            "answer": "La consulta no puede ser respondida ya que no está relacionada al ámbito legal.",
            "status": "exception",
            "exception_code": "not_domain_related",
            "sources": [],
            "similar_docs": []
        }

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

    is_answerable = check_answerability(
        context=doc_context_text + " " + highlighted_context,
        prompt=prompt
    )
    if (not is_answerable):
        return {
            "answer": "La consulta no puede ser respondida ya que no se posee el contexto suficiente en los documentos analizados.",
            "status": "exception",
            "exception_code": "not_enough_context",
            "sources": [],
            "similar_docs": []
        }

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
    - Si la respuesta no se encuentra explícitamente en el contexto, responde exactamente:
        "NO SE ENCUENTRA INFORMACIÓN EN LOS DOCUMENTOS ANALIZADOS."
"""

    # answer = 'test'

    # '''
    # Call LLM (respetando config si existe)
    answer = generate_chat_response(
        final_prompt,
        # temperature=config.get("temperature") if config else None,
        # max_tokens=config.get("max_tokens") if config else None,
        # model=config.get("model") if config else None,
    )
    # '''

    logger.info(final_prompt)

    # Return answer + structured sources
    return {
        "answer": answer,
        "status": "success",
        "exception_code": None,
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
