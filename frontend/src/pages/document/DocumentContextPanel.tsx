import { useState } from "react"
import type { SearchMatch } from "@/types/document/documentItem"
import { cn } from "@/lib/utils"

// Match colors corresponding to CSS variables --match-1 through --match-5
const MATCH_COLORS = [
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
}

export function DocumentContextPanel({ matches, activeIndex, onJump }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!matches.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No matches found in this document
      </p>
    )
  }

  const handleClick = (index: number, page: number, text: string, e: React.MouseEvent) => {
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

        return (
          <button
            key={i}
            className={cn(
              "w-full text-left rounded-md border-l-4 p-3 transition-all",
              isActive
                ? "ring-2 ring-offset-2 bg-muted"
                : "hover:bg-muted/50"
            )}
            style={{
              borderLeftColor: color,
              ...(isActive && {
                ringColor: color,
                boxShadow: `0 0 0 2px ${color}`,
              }),
            }}
            onClick={(e) => handleClick(i, m.page, m.text, e)}
          >
            <div className="text-xs text-muted-foreground mb-1">
              Pagina {m.page} · puntuación {(m.score * 100).toFixed(2)}%
            </div>

            <p className={cn(
              "text-sm leading-snug transition-all",
              isExpanded ? "" : "line-clamp-3"
            )}>
              {m.text}
            </p>
          </button>
        )
      })}
    </div>
  )
}
