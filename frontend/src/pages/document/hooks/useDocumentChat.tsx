import type { ChatMessage } from "@/types/chat/chat"
import type { SearchMatch } from "@/types/document/documentItem"
import type { HighlightedText } from "./useContextSelection"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export type ChatContext = {
    chunks: SearchMatch[]
    highlightedTexts: HighlightedText[]
}

export function useDocumentChat(docId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessionId] = useState(() => crypto.randomUUID())
    const socketRef = useRef<WebSocket | null>(null)

    const auth = useAuth()

    useEffect(() => {
        //usamos variables de entorno de vite
        const ws = new WebSocket(
            `api/documents/${docId}/chat`
        ) // new WebSocket(`ws://localhost:8080/api/documents/${docId}/chat`)
        socketRef.current = ws
        ws.onopen = () => {
            console.log("WS connected")
        }

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            setMessages((prev) => [...prev, { id: msg.message_id, role: "assistant", content: msg.prompt }])
        }

        ws.onerror = (e) => {
            console.error("WS error", e)
        }

        ws.onclose = () => {
            console.log("WS closed")
        }

        return () => {
            ws.close()
        }
    }, [docId])

    function sendMessage(text: string, context?: ChatContext) {
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return

        if (!auth.user) {
            console.error("Cannot send message: user not authenticated")
            return
        }

        const messageId = crypto.randomUUID()

        // Build message following protocol.md structure
        const payload = {
            message_id: messageId,
            session_id: sessionId,
            user_id: auth.user.id,
            timestamp: Date.now(),
            type: "user_message",
            prompt: text,
            context: context ? {
                document_ids: [docId],
                chunks_ids: context.chunks.map(c => c.chunk_id),
                highlighted_texts: context.highlightedTexts.map(ht => ({
                    text: ht.text,
                    document_id: ht.documentId,
                    position: { start: 0, end: ht.text.length },
                    page: ht.page,
                })),
            } : {
                document_ids: [docId],
                chunks_ids: [],
                highlighted_texts: [],
            },
        }

        console.log("Sending message payload:", payload)
        ws.send(JSON.stringify(payload))

        setMessages((prev) => [
            ...prev,
            { id: messageId, role: "user", content: text },
        ])
    }

    return { messages, sendMessage, sessionId }
}
