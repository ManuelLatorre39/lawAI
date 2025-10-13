# agents.py
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
from langchain.chat_models import ChatOllama
from simulated_db import LEGAL_CASE

# Define the shared state structure
class State(TypedDict):
    query: str
    context: str
    answer: str
    route: Literal["reader", "llm", "done"]

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

def coordinator(state: State) -> State:
    query = state["query"].lower()
    # Simple rule-based routing
    if any(word in query for word in ["expediente", "juzgado", "actor", "demandado", "resolución", "fundamento"]):
        state["route"] = "reader"
    else:
        state["route"] = "llm"
    return state