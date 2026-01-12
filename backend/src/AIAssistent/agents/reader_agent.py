# agents.py
import os
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
from google import genai
from dotenv import load_dotenv
from simulated_db import LEGAL_CASE
from state import State

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

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

# LLM Agent to answer based on context using Gemini
def llm_agent(state: State) -> State:
    prompt = (
        f"Tienes acceso al siguiente expediente judicial:\n\n{state['context']}\n\n"
        f"Pregunta del usuario: {state['query']}\n\n"
        f"Responde de forma clara y concisa."
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    state["answer"] = response.text
    state["route"] = "done"
    return state