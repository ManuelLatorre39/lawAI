from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from datetime import datetime
from src.services.document_chat_service import chat_with_document
from src.services.session.session_service import save_message
from bson import ObjectId
from src.helpers.logger import logger

router = APIRouter(prefix="/documents")

@router.websocket("/{document_id}/chat")
async def document_chat_ws(
    websocket: WebSocket, 
    document_id: str,
    # session_id: str,
    # dni: str
):
    await websocket.accept()

    try:
        while True:
            msg = await websocket.receive_json()

            save_message({
                "message_id": msg["message_id"],
                "session_id": msg["session_id"],
                "document_id": document_id,
                "user_id": msg["user_id"],
                "type": "user",
                "prompt": msg["prompt"],
                "context": msg["context"],
                "config": msg.get("config"),
                "metadata": msg.get("metadata"),
                "created_at": datetime.utcnow(),
            })

            response = await chat_with_document(
                document_id=document_id,
                prompt=msg["prompt"],
                context=msg["context"],
                config=msg.get("config")
            )
            
            bot_msg = {
                "message_id": str(ObjectId()),
                "session_id": str(msg["session_id"]),
                "timestamp": int(datetime.utcnow().timestamp()),
                "user_id": "system",
                "type": "bot",
                "prompt": response["answer"],
                "context": {
                    "document_ids": [str(document_id)],
                    "chunks_ids": [str(s["chunk_id"]) for s in response["sources"]],
                    "highlighted_texts": []
                },
                "similar_docs": response["similar_docs"]

            }

            # Save bot message
            save_message(bot_msg)

            # Send to client
            await websocket.send_json(jsonable_encoder(bot_msg))
    except WebSocketDisconnect:
        print(f"Client disconnected from document {document_id}")
