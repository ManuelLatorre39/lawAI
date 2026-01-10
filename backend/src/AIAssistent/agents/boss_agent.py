from state import State

def coordinator(state: State) -> State:
    query = state["query"].lower()
    # Simple rule-based routing
    if any(word in query for word in ["expediente", "juzgado", "actor", "demandado", "resolución", "fundamento"]):
        state["route"] = "reader"
    else:
        state["route"] = "llm"
    return state