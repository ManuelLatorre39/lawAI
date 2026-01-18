import { useState } from "react"
import type { SearchMatch } from "@/types/document/documentItem"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

// Match colors corresponding to CSS variables --match-1 through --match-5
export const MATCH_COLORS = [
  "oklch(0.646 0.222 41.116)", // orange
  "oklch(0.6 0.118 184.704)",  // cyan
  "oklch(0.828 0.189 84.429)", // yellow
  "oklch(0.769 0.188 70.08)",  // gold
  "oklch(0.398 0.07 227.392)", // blue
]

type Props = {
  matches: SearchMatch[]
  activeIndex: number | null
  onJump: (index: number, page: number, text: string) => void
  // Selection mode props
  selectionMode?: boolean
  isChunkSelected?: (chunkId: string) => boolean
  getChunkSelectionOrder?: (chunkId: string) => number | null
  onToggleChunk?: (chunk: SearchMatch) => void
}

export function DocumentContextPanel({
  matches,
  activeIndex,
  onJump,
  selectionMode = false,
  isChunkSelected,
  getChunkSelectionOrder,
  onToggleChunk,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!matches.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No matches found in this document
      </p>
    )
  }

  const handleClick = (index: number, page: number, text: string, match: SearchMatch) => {
    // In selection mode, toggle the chunk selection
    if (selectionMode && onToggleChunk) {
      onToggleChunk(match)
      return
    }

    // If clicking on the same panel, toggle expansion
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
    
    // Always trigger navigation
    onJump(index, page, text)
  }

  return (
    <div className="space-y-3">
      {matches.map((m, i) => {
        const colorIndex = i % 5
        const color = MATCH_COLORS[colorIndex]
        const isActive = activeIndex === i
        const isExpanded = expandedIndex === i
        const isSelected = selectionMode && isChunkSelected?.(m.chunk_id)
        const selectionOrder = selectionMode ? getChunkSelectionOrder?.(m.chunk_id) : null

        return (
          <button
            key={m.chunk_id || i}
            className={cn(
              "w-full text-left rounded-md border-l-4 p-3 transition-all relative",
              isActive && !selectionMode
                ? "ring-2 ring-offset-2 bg-muted"
                : "hover:bg-muted/50",
              isSelected && "ring-2 ring-offset-1 bg-muted/70"
            )}
            style={{
              borderLeftColor: color,
              ...((isActive && !selectionMode) && {
                ringColor: color,
                boxShadow: `0 0 0 2px ${color}`,
              }),
              ...(isSelected && {
                boxShadow: `0 0 0 2px ${color}`,
              }),
            }}
            onClick={() => handleClick(i, m.page, m.text, m)}
          >
            {/* Selection checkbox and order badge */}
            {selectionMode && (
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {selectionOrder !== null && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {selectionOrder}
                  </span>
                )}
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleChunk?.(m)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="h-4 w-4"
                  style={{
                    borderColor: color,
                    ...(isSelected && { backgroundColor: color }),
                  }}
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground mb-1">
              Pagina {m.page} · puntuación {(m.score * 100).toFixed(2)}%
            </div>

            <p className={cn(
              "text-sm leading-snug transition-all",
              isExpanded ? "" : "line-clamp-3",
              selectionMode && "pr-14" // Make room for checkbox
            )}>
              {m.text}
            </p>
          </button>
        )
      })}
    </div>
  )
}
