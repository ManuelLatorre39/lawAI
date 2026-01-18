import { useState } from "react"
import { useDocumentChat } from "./hooks/useDocumentChat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChatContextBar } from "./ChatContextBar"
import type { UseContextSelectionReturn } from "./hooks/useContextSelection"
import { ListChecks, Send, Plus, Highlighter, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type Props = {
    docId: string
    contextSelection: UseContextSelectionReturn
    getChunkColorIndex: (chunkId: string) => number
    chunkSelectionMode: boolean
    onChunkSelectionModeChange: (value: boolean) => void
    textSelectionMode: boolean
    onTextSelectionModeChange: (value: boolean) => void
}

export function DocumentChat({
    docId,
    contextSelection,
    getChunkColorIndex,
    chunkSelectionMode,
    onChunkSelectionModeChange,
    textSelectionMode,
    onTextSelectionModeChange,
}: Props) {
    const { messages, sendMessage } = useDocumentChat(docId)
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) return

        // Build context from selection
        const context = contextSelection.hasContext
            ? {
                chunks: contextSelection.selectedChunks,
                highlightedTexts: contextSelection.highlightedTexts,
            }
            : undefined
            
        sendMessage(input, context)
        setInput("")
    }

    // Check if any selection mode is active
    const hasActiveMode = chunkSelectionMode || textSelectionMode

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Context bar */}
            <div className="px-3 pt-3 shrink-0">
                <ChatContextBar
                    selectedChunks={contextSelection.selectedChunks}
                    highlightedTexts={contextSelection.highlightedTexts}
                    totalHighlightChars={contextSelection.totalHighlightChars}
                    maxHighlightChars={contextSelection.maxHighlightChars}
                    onRemoveChunk={contextSelection.removeChunk}
                    onRemoveHighlight={contextSelection.removeHighlightedText}
                    onClearAll={contextSelection.clearAll}
                    getChunkColorIndex={getChunkColorIndex}
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto space-y-3 p-3 min-h-0">
                {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Haz una pregunta sobre el documento...
                    </p>
                )}
                {messages.map((m) => {
                    return (
                        <div
                            key={m.id}
                            className={cn(
                                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                                m.role === "user"
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "bg-muted"
                            )}
                        >
                            {m?.content}
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <div className="p-3 border-t shrink-0 space-y-2">
                {/* Active mode badges */}
                {hasActiveMode && (
                    <div className="flex flex-wrap gap-1.5">
                        {chunkSelectionMode && (
                            <Badge
                                variant="secondary"
                                className="gap-1 pr-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                                <ListChecks className="h-3 w-3" />
                                Seleccionando párrafos
                                <button
                                    onClick={() => onChunkSelectionModeChange(false)}
                                    className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {textSelectionMode && (
                            <Badge
                                variant="secondary"
                                className="gap-1 pr-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                                <Highlighter className="h-3 w-3" />
                                Resaltando texto
                                <button
                                    onClick={() => onTextSelectionModeChange(false)}
                                    className="ml-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}

                {/* Input row */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex gap-2"
                >
                    {/* Add context dropdown - opens upward */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant={hasActiveMode ? "default" : "outline"}
                                size="icon"
                                title="Agregar contexto"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="start" className="w-56">
                            <DropdownMenuItem
                                onClick={() => onChunkSelectionModeChange(!chunkSelectionMode)}
                                className="gap-2 cursor-pointer"
                            >
                                <ListChecks className={cn(
                                    "h-4 w-4",
                                    chunkSelectionMode && "text-primary"
                                )} />
                                <div className="flex-1">
                                    <p className="font-medium">Seleccionar párrafos</p>
                                    <p className="text-xs text-muted-foreground">
                                        Elige párrafos similares como contexto
                                    </p>
                                </div>
                                {chunkSelectionMode && (
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onTextSelectionModeChange(!textSelectionMode)}
                                className="gap-2 cursor-pointer"
                            >
                                <Highlighter className={cn(
                                    "h-4 w-4",
                                    textSelectionMode && "text-primary"
                                )} />
                                <div className="flex-1">
                                    <p className="font-medium">Resaltar texto</p>
                                    <p className="text-xs text-muted-foreground">
                                        Selecciona texto del PDF como contexto
                                    </p>
                                </div>
                                {textSelectionMode && (
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregunta sobre el documento…"
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
