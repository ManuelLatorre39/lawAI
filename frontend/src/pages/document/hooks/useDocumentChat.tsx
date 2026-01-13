import type { ChatMessage } from "@/types/chat/chat"
import { useEffect, useRef, useState } from "react"


export function useDocumentChat(docId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(
            `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/documents/${docId}/chat`
        ) // new WebSocket(`ws://localhost:8080/api/documents/${docId}/chat`)
        socketRef.current = ws

        ws.onopen = () => {
            console.log("WS connected")
        }

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            setMessages((prev) => [...prev, msg])
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

    function sendMessage(text: string) {
        const ws = socketRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return

        ws.send(JSON.stringify({
            type: "user_message",
            content: text,
        }))

        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", content: text },
        ])
    }

    return { messages, sendMessage }
}
