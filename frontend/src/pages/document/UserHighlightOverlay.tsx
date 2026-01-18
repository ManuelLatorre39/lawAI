import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HighlightedText } from "./hooks/useContextSelection"

// User highlight color (distinct from search match colors)
const USER_HIGHLIGHT_COLOR = "oklch(0.7 0.15 150)" // green-ish

type Props = {
  highlights: HighlightedText[]
  currentPage: number
  onRemove: (id: string) => void
}

export function UserHighlightOverlay({ highlights, currentPage, onRemove }: Props) {
  // Filter highlights for current page
  const pageHighlights = highlights.filter((h) => h.page === currentPage)

  if (pageHighlights.length === 0) return null

  return (
    <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 max-w-[250px]">
      {pageHighlights.map((h, index) => (
        <div
          key={h.id}
          className={cn(
            "group relative bg-background/95 backdrop-blur border rounded-lg shadow-lg p-2",
            "animate-in fade-in slide-in-from-right-2 duration-200"
          )}
          style={{
            borderLeftWidth: 4,
            borderLeftColor: USER_HIGHLIGHT_COLOR,
          }}
        >
          {/* Remove button */}
          <button
            onClick={() => onRemove(h.id)}
            className={cn(
              "absolute -top-2 -right-2 p-1 rounded-full",
              "bg-destructive text-destructive-foreground",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-destructive/90"
            )}
            title="Eliminar nota"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Note indicator */}
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-3 h-3 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: USER_HIGHLIGHT_COLOR }}
            >
              {index + 1}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Nota seleccionada
            </span>
          </div>

          {/* Text preview */}
          <p className="text-xs leading-snug line-clamp-3 text-foreground/80">
            "{h.text.slice(0, 100)}{h.text.length > 100 ? "..." : ""}"
          </p>

          {/* Character count */}
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {h.text.length} caracteres
          </span>
        </div>
      ))}
    </div>
  )
}
