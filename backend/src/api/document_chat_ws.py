from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.services.document_chat_service import chat_with_document

router = APIRouter(prefix="/documents")

@router.websocket("/{document_id}/chat")
async def document_chat_ws(websocket: WebSocket, document_id: str):
    await websocket.accept()

    try:
        while True:
            user_message = await websocket.receive_text()

            response = await chat_with_document(
                document_id=document_id,
                user_message=user_message
            )

            # print(response.candidates[0].content.parts[0].text)
            await websocket.send_json({"type": "assistant", "content": response})

    except WebSocketDisconnect:
        print(f"Client disconnected from document {document_id}")
