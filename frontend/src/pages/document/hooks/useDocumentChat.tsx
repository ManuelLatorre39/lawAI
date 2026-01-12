import type { ChatMessage } from "@/types/chat/chat"
import { useEffect, useRef, useState } from "react"


export function useDocumentChat(docId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080/api/documents/${docId}/chat`)
        socketRef.current = ws

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "token") {
                setMessages((prev) => {
                    const last = prev[prev.length - 1]
                    if (last?.role === "assistant") {
                        return [
                            ...prev.slice(0, -1),
                            { ...last, content: last.content + data.token },
                        ]
                    }
                    return [
                        ...prev,
                        {
                            id: crypto.randomUUID(),
                            role: "assistant",
                            content: data.token,
                        },
                    ]
                })
            }
        }

        return () => ws.close()
    }, [docId])

    function sendMessage(text: string) {
        socketRef.current?.send(
            JSON.stringify({ type: "user_message", content: text })
        )

        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", content: text },
        ])
    }

    return { messages, sendMessage }
}
