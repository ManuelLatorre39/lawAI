import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SearchMatch } from "@/types/document/documentItem"
import type { HighlightedText } from "./hooks/useContextSelection"

// Match colors corresponding to CSS variables --match-1 through --match-5
const MATCH_COLORS = [
  "oklch(0.646 0.222 41.116)", // orange
  "oklch(0.6 0.118 184.704)",  // cyan
  "oklch(0.828 0.189 84.429)", // yellow
  "oklch(0.769 0.188 70.08)",  // gold
  "oklch(0.398 0.07 227.392)", // blue
]

type Props = {
  selectedChunks: SearchMatch[]
  highlightedTexts: HighlightedText[]
  totalHighlightChars: number
  maxHighlightChars: number
  onRemoveChunk: (chunkId: string) => void
  onRemoveHighlight: (id: string) => void
  onClearAll: () => void
  /** Maps chunk_id to its original index in the matches array (for color) */
  getChunkColorIndex?: (chunkId: string) => number
}

export function ChatContextBar({
  selectedChunks,
  highlightedTexts,
  totalHighlightChars,
  maxHighlightChars,
  onRemoveChunk,
  onRemoveHighlight,
  onClearAll,
  getChunkColorIndex,
}: Props) {
  const hasContent = selectedChunks.length > 0 || highlightedTexts.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Contexto seleccionado
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onClearAll}
        >
          Limpiar todo
        </Button>
      </div>

      {/* Selected chunks */}
      {selectedChunks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedChunks.map((chunk, orderIndex) => {
            const colorIndex = getChunkColorIndex
              ? getChunkColorIndex(chunk.chunk_id)
              : orderIndex
            const color = MATCH_COLORS[colorIndex % 5]

            return (
              <Badge
                key={chunk.chunk_id}
                variant="outline"
                className="gap-1 pr-1 text-xs"
                style={{
                  borderColor: color,
                  backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`,
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {orderIndex + 1}
                </span>
                <span className="max-w-[120px] truncate">
                  Pág. {chunk.page}
                </span>
                <button
                  onClick={() => onRemoveChunk(chunk.chunk_id)}
                  className="ml-0.5 hover:bg-background/50 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Highlighted texts */}
      {highlightedTexts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Textos resaltados
            </span>
            <span className="text-xs text-muted-foreground">
              {totalHighlightChars}/{maxHighlightChars} caracteres
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {highlightedTexts.map((ht) => (
              <Badge
                key={ht.id}
                variant="secondary"
                className="gap-1 pr-1 text-xs max-w-full"
              >
                <span className="truncate max-w-[200px]">
                  "{ht.text.slice(0, 30)}..."
                </span>
                <span className="text-muted-foreground shrink-0">
                  (p.{ht.page})
                </span>
                <button
                  onClick={() => onRemoveHighlight(ht.id)}
                  className="ml-0.5 hover:bg-background/50 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
