from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal
from reader_agent import coordinator, reader_agent, llm_agent  # Make sure these are defined
# agents.py should have: coordinator, reader_agent, llm_agent

# Define the shared state structure
class State(TypedDict):
    query: str
    context: str
    answer: str
    route: Literal["reader", "llm", "done"]

# Build the LangGraph
graph = StateGraph(State)

# Add nodes
graph.add_node("coordinator", coordinator)
graph.add_node("reader", reader_agent)
graph.add_node("llm", llm_agent)

# Connect START -> coordinator
graph.add_edge(START, "coordinator")

# Coordinator routes
graph.add_conditional_edges(
    "coordinator",
    lambda s: s["route"],
    {
        "reader": "reader",
        "llm": "llm"
    },
)

# Reader always routes to LLM
graph.add_conditional_edges(
    "reader",
    lambda s: s["route"],
    {"llm": "llm"}
)

# LLM -> END
graph.add_edge("llm", END)

# Compile the graph
legal_graph = graph.compile()