from fastapi import FastAPI
from dotenv import load_dotenv
from pathlib import Path
from fastapi import FastAPI
from src.api.upload import router as upload_router

root_dir = Path(__file__).resolve().parent
root_root_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=root_dir / ".env")

app = FastAPI()

app.include_router(upload_router)

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
