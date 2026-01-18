from fastapi import APIRouter
from src.services.conversation.conversation_service import create_conversation_service, get_all_conversations, get_conversation_messages

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.get("/conversations")
def list_conversations(dni: str):
    return get_all_conversations(dni)

@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str):
    return get_conversation_messages(conversation_id)

@router.post("/{document_id}")
def create_conversation(document_id: str, dni: str):
    response = create_conversation_service(document_id, dni)
    return {
        "conversation_id": str(response)
    }