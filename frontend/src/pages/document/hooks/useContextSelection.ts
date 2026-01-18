import { useState, useCallback, useMemo } from "react"
import type { SearchMatch } from "@/types/document/documentItem"

export type HighlightedText = {
  id: string
  text: string
  page: number
  documentId: string
}

export type ContextSelection = {
  selectedChunks: SearchMatch[]
  highlightedTexts: HighlightedText[]
}

const MAX_HIGHLIGHT_CHARS = 4000
const MAX_SINGLE_SELECTION_CHARS = 2000

export function useContextSelection(documentId: string) {
  const [selectedChunks, setSelectedChunks] = useState<SearchMatch[]>([])
  const [highlightedTexts, setHighlightedTexts] = useState<HighlightedText[]>([])

  // Calculate total characters used by highlighted texts
  const totalHighlightChars = useMemo(() => {
    return highlightedTexts.reduce((sum, h) => sum + h.text.length, 0)
  }, [highlightedTexts])

  // Check if a chunk is selected
  const isChunkSelected = useCallback(
    (chunkId: string) => {
      return selectedChunks.some((c) => c.chunk_id === chunkId)
    },
    [selectedChunks]
  )

  // Get selection order (1-based index) for a chunk
  const getChunkSelectionOrder = useCallback(
    (chunkId: string) => {
      const index = selectedChunks.findIndex((c) => c.chunk_id === chunkId)
      return index >= 0 ? index + 1 : null
    },
    [selectedChunks]
  )

  // Toggle chunk selection
  const toggleChunk = useCallback((chunk: SearchMatch) => {
    setSelectedChunks((prev) => {
      const exists = prev.some((c) => c.chunk_id === chunk.chunk_id)
      if (exists) {
        return prev.filter((c) => c.chunk_id !== chunk.chunk_id)
      } else {
        return [...prev, chunk]
      }
    })
  }, [])

  // Add highlighted text (with truncation and limit check)
  const addHighlightedText = useCallback(
    (text: string, page: number) => {
      // Truncate single selection to max allowed
      const truncatedText = text.slice(0, MAX_SINGLE_SELECTION_CHARS)
      
      // Check if adding would exceed total limit
      const newTotal = totalHighlightChars + truncatedText.length
      if (newTotal > MAX_HIGHLIGHT_CHARS) {
        const availableChars = MAX_HIGHLIGHT_CHARS - totalHighlightChars
        if (availableChars <= 0) {
          console.warn("Cannot add more highlighted text: limit reached")
          return false
        }
        // Further truncate to fit within limit
        const finalText = truncatedText.slice(0, availableChars)
        const newHighlight: HighlightedText = {
          id: crypto.randomUUID(),
          text: finalText,
          page,
          documentId,
        }
        setHighlightedTexts((prev) => [...prev, newHighlight])
        return true
      }

      const newHighlight: HighlightedText = {
        id: crypto.randomUUID(),
        text: truncatedText,
        page,
        documentId,
      }
      setHighlightedTexts((prev) => [...prev, newHighlight])
      return true
    },
    [documentId, totalHighlightChars]
  )

  // Remove highlighted text by id
  const removeHighlightedText = useCallback((id: string) => {
    setHighlightedTexts((prev) => prev.filter((h) => h.id !== id))
  }, [])

  // Remove chunk by id
  const removeChunk = useCallback((chunkId: string) => {
    setSelectedChunks((prev) => prev.filter((c) => c.chunk_id !== chunkId))
  }, [])

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedChunks([])
    setHighlightedTexts([])
  }, [])

  // Clear only chunks
  const clearChunks = useCallback(() => {
    setSelectedChunks([])
  }, [])

  // Clear only highlights
  const clearHighlights = useCallback(() => {
    setHighlightedTexts([])
  }, [])

  // Check if we have any context selected
  const hasContext = selectedChunks.length > 0 || highlightedTexts.length > 0

  // Get remaining characters for highlights
  const remainingHighlightChars = MAX_HIGHLIGHT_CHARS - totalHighlightChars

  return {
    selectedChunks,
    highlightedTexts,
    isChunkSelected,
    getChunkSelectionOrder,
    toggleChunk,
    addHighlightedText,
    removeHighlightedText,
    removeChunk,
    clearAll,
    clearChunks,
    clearHighlights,
    hasContext,
    totalHighlightChars,
    remainingHighlightChars,
    maxHighlightChars: MAX_HIGHLIGHT_CHARS,
  }
}

export type UseContextSelectionReturn = ReturnType<typeof useContextSelection>
