from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
from src.services.document_chat_service import chat_with_document
from src.services.conversation.conversation_service import save_message
from bson import ObjectId

router = APIRouter(prefix="/documents")

@router.websocket("/{document_id}/chat")
async def document_chat_ws(
    websocket: WebSocket, 
    document_id: str,
    conversation_id: str,
    dni: str
):
    await websocket.accept()

    try:
        while True:
            user_message = await websocket.receive_text()

            save_message({
                "conversation_id": ObjectId(conversation_id),
                "document_id": document_id,
                "user_dni": dni,
                "role": "user",
                "content": user_message,
                "created_at": datetime.utcnow(),
            })

            response = await chat_with_document(
                document_id=document_id,
                user_message=user_message
            )
            
            save_message({
                "conversation_id": ObjectId(conversation_id),
                "document_id": document_id,
                "user_dni": dni,
                "role": "assistant",
                "content": user_message,
                "created_at": datetime.utcnow(),
            })

            # print(response.candidates[0].content.parts[0].text)
            await websocket.send_json({"type": "assistant", "content": response["answer"], "sources": response["sources"]})

    except WebSocketDisconnect:
        print(f"Client disconnected from document {document_id}")
