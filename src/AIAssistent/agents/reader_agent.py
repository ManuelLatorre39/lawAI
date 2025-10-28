# agents.py
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
from langchain.chat_models import ChatOllama
from simulated_db import LEGAL_CASE
from state import State

# Create a Reader Agent (retrieves from our simulated DB)
def reader_agent(state: State) -> State:
    query = state["query"].lower()
    response = None
    for key, value in LEGAL_CASE.items():
        if key.lower() in query:
            response = f"{key}: {value}"
            break
    if not response:
        response = " ".join(f"{k}: {v}" for k, v in LEGAL_CASE.items())

    state["context"] = response
    state["route"] = "llm"
    return state

# LLM Agent to answer based on context
llm = ChatOllama(model="llama2", temperature=0)  # or "llama2-13b"

def llm_agent(state: State) -> State:
    prompt = (
        f"Tienes acceso al siguiente expediente judicial:\n\n{state['context']}\n\n"
        f"Pregunta del usuario: {state['query']}\n\n"
        f"Responde de forma clara y concisa."
    )
    answer = llm.predict(prompt)
    state["answer"] = answer
    state["route"] = "done"
    return state