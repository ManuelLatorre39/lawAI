import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, PanelLeftClose, PanelLeft } from "lucide-react"
import { DocumentContextPanel } from "./DocumentContextPanel"
import type { SearchMatch } from "@/types/document/documentItem"
import { cn } from "@/lib/utils"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"

// Use the worker bundled with react-pdf to avoid version mismatch
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export type Highlight = {
  text: string
  colorIndex: number
  isActive: boolean
  page: number
}

type Props = {
  file: string | Blob
  highlights: Highlight[]
  scrollToPage: number | null
  highlightAll?: boolean
  onHighlightAllChange?: (value: boolean) => void
  matches?: SearchMatch[]
  activeMatchIndex?: number | null
  onMatchJump?: (index: number, page: number) => void
}

export function PdfViewer({
  file,
  highlights,
  scrollToPage,
  highlightAll = false,
  onHighlightAllChange,
  matches = [],
  activeMatchIndex = null,
  onMatchJump,
}: Props) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState("")
  const [containerWidth, setContainerWidth] = useState(600)
  const [scale, setScale] = useState(1.0)
  const [sidebarOpen, setSidebarOpen] = useState(matches.length > 0)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Track container width with ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerWidth(entry.contentRect.width - 32)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Open sidebar when matches are available
  useEffect(() => {
    if (matches.length > 0) {
      setSidebarOpen(true)
    }
  }, [matches.length])

  // Handle match jump
  const handleMatchJump = (index: number, page: number, _text: string) => {
    if (onMatchJump) {
      onMatchJump(index, page)
    }
  }

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
    },
    []
  )

  // Navigate to page when scrollToPage changes (from clicking a match)
  useEffect(() => {
    if (scrollToPage !== null && scrollToPage > 0 && scrollToPage <= numPages) {
      setCurrentPage(scrollToPage)
    }
  }, [scrollToPage, numPages])

  // Build highlights for current page
  const currentPageHighlights = useMemo(() => {
    return highlights.filter((h) => h.page === currentPage)
  }, [highlights, currentPage])

  // Apply highlights to the current page
  const applyHighlights = useCallback(() => {
    const pageElement = pageRef.current
    if (!pageElement) return

    const textLayer = pageElement.querySelector(".react-pdf__Page__textContent")
    if (!textLayer) return

    const spans = Array.from(textLayer.querySelectorAll("span")) as HTMLSpanElement[]

    // Clear all previous highlights
    spans.forEach((span) => {
      span.classList.remove(
        "pdf-highlight",
        "pdf-highlight-1",
        "pdf-highlight-2",
        "pdf-highlight-3",
        "pdf-highlight-4",
        "pdf-highlight-5",
        "active-highlight"
      )
    })

    if (currentPageHighlights.length === 0) return

    // If highlighting is disabled and no active highlight, skip
    if (!highlightAll && !currentPageHighlights.some((h) => h.isActive)) {
      return
    }

    // Filter highlights based on highlightAll setting
    const highlightsToApply = highlightAll
      ? currentPageHighlights
      : currentPageHighlights.filter((h) => h.isActive)

    if (highlightsToApply.length === 0) return

    // Apply highlights
    for (const span of spans) {
      const spanText = (span.textContent || "").toLowerCase().trim()
      if (spanText.length < 2) continue

      for (const highlight of highlightsToApply) {
        const highlightText = highlight.text.toLowerCase()

        if (highlightText.includes(spanText) || spanText.includes(highlightText.slice(0, 20))) {
          const colorClass = `pdf-highlight-${(highlight.colorIndex % 5) + 1}`
          span.classList.add("pdf-highlight", colorClass)
          if (highlight.isActive) {
            span.classList.add("active-highlight")
          }
          break
        }
      }
    }
  }, [currentPageHighlights, highlightAll])

  // Apply highlights after page renders
  const handlePageRenderSuccess = useCallback(() => {
    setTimeout(() => {
      applyHighlights()
    }, 200)
  }, [applyHighlights])

  // Re-apply highlights when highlights or highlightAll changes
  useEffect(() => {
    const timer = setTimeout(() => {
      applyHighlights()
    }, 50)
    return () => clearTimeout(timer)
  }, [applyHighlights])

  // Convert blob to Uint8Array for react-pdf
  const [fileData, setFileData] = useState<Uint8Array | null>(null)

  useEffect(() => {
    if (file instanceof Blob) {
      file.arrayBuffer().then((buffer) => {
        setFileData(new Uint8Array(buffer))
      })
    }
  }, [file])

  // Memoize the file object to prevent unnecessary reloads
  const memoizedFile = useMemo(() => {
    if (!fileData) return null
    return { data: fileData }
  }, [fileData])

  // Navigation handlers
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1))
  }

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(pageInput, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum)
      setPageInput("")
    }
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setScale(1.0)
  }

  if (!memoizedFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="w-full h-[600px]" />
      </div>
    )
  }

  return (
    <Document
      className="h-full"
      file={memoizedFile}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={
        <div className="flex items-center justify-center h-full">
          <Skeleton className="w-full h-[600px]" />
        </div>
      }
      error={
        <div className="flex items-center justify-center h-full text-destructive">
          Error loading PDF
        </div>
      }
    >
      <div className="h-full flex">
        {/* Sidebar */}
        <div
          className={cn(
            "border-r bg-background transition-all duration-300 overflow-hidden flex-shrink-0",
            sidebarOpen ? "w-90" : "w-0"
          )}
        >
          {sidebarOpen && (
            <div className="h-full overflow-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Párrafos similares ({matches.length})
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSidebarOpen(false)}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>
              <DocumentContextPanel
                matches={matches}
                activeIndex={activeMatchIndex}
                onJump={handleMatchJump}
              />
            </div>
          )}
        </div>

        {/* Main PDF viewer */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Header with navigation and toggle */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-2 flex items-center justify-between gap-4">
            {/* Page navigation */}
            <div className="flex items-center gap-2 ">
              {/* Sidebar toggle */}
              {matches.length > 0 && !sidebarOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  title="Mostrar párrafos"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[100px] text-center">
              Página {currentPage} de {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 ml-auto">
              <p>Pag: </p>
              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                <Input
                  type="number"
                  min="1"
                  max={numPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder={`${currentPage}`}
                  className="w-20 h-8 text-sm"
                />
              </form>
            
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetZoom}
              title="Resetear zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Highlight toggle */}
          {onHighlightAllChange && highlights.length > 0 && (
            <div className="flex items-center gap-2 mr-10">
              <Switch
                id="highlight-all"
                checked={highlightAll}
                onCheckedChange={onHighlightAllChange}
              />
              <Label htmlFor="highlight-all" className="text-sm cursor-pointer">
                Resaltar todo
              </Label>
            </div>
          )}
          </div>

          {/* PDF page container */}
          <div ref={containerRef} className="flex-1 min-h-0 overflow-auto px-4 py-4">
            <div ref={pageRef} className="inline-flex justify-center min-w-full">
              <Page
                pageNumber={currentPage}
                width={containerWidth * scale}
                loading={<Skeleton className="w-full " />}
                onRenderSuccess={handlePageRenderSuccess}
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </div>
          </div>
        </div>
      </div>
    </Document>
  )
}
