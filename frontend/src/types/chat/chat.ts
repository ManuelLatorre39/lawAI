import type { SearchMatch } from "../document/documentItem"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  // sources: SearchMatch[]
}