from fastapi import APIRouter
from src.services.session.session_service import create_session_service, get_all_sessions, get_session_messages

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.get("")
def list_sessions(dni: str):
    return get_all_sessions(dni)

@router.get("/{session_id}")
def get_session(session_id: str):
    return get_session_messages(session_id)

@router.post("/{document_id}")
def create_session(document_id: str, dni: str):
    response = create_session_service(document_id, dni)
    return {
        "session_id": str(response)
    }