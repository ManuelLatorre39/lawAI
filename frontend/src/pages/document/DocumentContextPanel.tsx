import type { SearchMatch } from "@/types/document/documentItem"

type Props = {
  matches: SearchMatch[]
  onJump: (page: number) => void
}

export function DocumentContextPanel({ matches, onJump }: Props) {
  if (!matches.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No matches found in this document
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((m, i) => (
        <button
          key={i}
          className="w-full text-left rounded-md border p-3 hover:bg-muted transition"
          onClick={() => onJump(m.page)}
        >
          <div className="text-xs text-muted-foreground mb-1">
            Page {m.page} · score {m.score.toFixed(2)}
          </div>

          <p className="text-sm leading-snug">
            {m.text}
          </p>
        </button>
      ))}
    </div>
  )
}
