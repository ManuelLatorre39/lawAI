import { useState } from "react"
import { useDocumentChat } from "./hooks/useDocumentChat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DocumentChat({ docId }: { docId: string }) {
    const { messages, sendMessage } = useDocumentChat(docId)
    const [input, setInput] = useState("")

    return (
        <div className="flex-1 flex flex-col border-t">
            {/* Messages */}
            <div className="flex-1 overflow-auto space-y-3 p-3">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            m.role === "user"
                                ? "ml-auto bg-primary text-primary-foreground"
                                : "bg-muted"
                        )}
                    >
                        {m.content}
                    </div>
                ))}
            </div>

            {/* Input */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(input)
                    setInput("")
                }}
                className="flex gap-2 p-2 border-t"
            >
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this document…"
                />
                <Button type="submit">Send</Button>
            </form>
        </div>
    )
}
