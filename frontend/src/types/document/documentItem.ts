export interface DocumentItem {
  id: string
  filename: string
  size: number
  status: "UPLOADED" | "PROCESSING" | "READY" | "ERROR"
  created_at: string,
  matches?: SearchMatch[]
}

export type SearchMatch = {
  chunk_id: string
  text: string
  page: number
  score: number
}

export type SearchResult = {
  document_id: string
  filename: string
  matches: SearchMatch[]
}

export type SearchDocumentItem = DocumentItem & {
  matches: SearchMatch[]
}

