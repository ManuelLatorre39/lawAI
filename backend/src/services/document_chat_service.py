from src.services.search_service import search_chunks
from src.services.gen_client_service import generate_chat_response

async def chat_with_document(document_id: str, user_message: str):
    # 1. Retrieve relevant chunks
    chunks = search_chunks(
        document_id=document_id,
        query=user_message,
        limit=5
    )

    # 2. Build context
    context = "\n\n".join(
        f"[Page {c['page_number']}] {c['text']}"
        for c in chunks
    )

    # 3. LLM prompt
    prompt = f"""
        You are a legal assistant answering questions using the provided document.

        DOCUMENT CONTEXT:
        {context}

        QUESTION:
        {user_message}

        Answer clearly and cite page numbers when relevant.
    """

    # 4. Call LLM
    answer = generate_chat_response(prompt)

    return {
        "answer": answer,
        "sources": [
            {
                "chunk_id": c["_id"],
                "page": c.get("page_number"),
                "score": c["score"]
            }
            for c in chunks
        ]
    }
