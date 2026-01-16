from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI
from src.api.documents import router as document_router
from src.api.document_chat_ws import router as document_chat_router
from src.api.auth import router as auth_router
from src.api.users import router as users_router

root_dir = Path(__file__).resolve().parent
root_root_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=root_dir / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # during development
    allow_credentials=True,
    allow_methods=["*"],          # <-- allows OPTIONS
    allow_headers=["*"],
)

app.include_router(document_router, prefix="/api")
app.include_router(document_chat_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")

'''
@app.post("/query")
async def query_docs(query: str = Form(...), top_k: int = Form(5)):
    """Perform semantic search."""
    results = 'test' # search.semantic_search(query, top_k=top_k)
    return {"results": results}
'''
'''
@app.post("/ask")
async def ask_docs(question: str = Form(...)):
    """Ask a natural-language question using retrieval + LLM."""
    context = search.retrieve_relevant_chunks(question)
    answer = llm.answer_question(question, context)
    return {"answer": answer, "context_used": len(context)}
'''
