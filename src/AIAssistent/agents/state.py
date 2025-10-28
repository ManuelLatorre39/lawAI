from typing import TypedDict, Literal

# Define the shared state structure
class State(TypedDict):
    query: str
    context: str
    answer: str
    route: Literal["reader", "llm", "done"]