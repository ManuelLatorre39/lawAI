import { useMemo, useState } from "react"
import type { DocumentItem, SearchMatch } from "@/types/document/documentItem"
import { useQuery } from "@tanstack/react-query"
import API from "@/services/APIService"
import { DocumentContextPanel } from "./DocumentContextPanel"
import { PdfViewer, type Highlight } from "./PdfViewer"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentChat } from "./DocumentChat"

type Props = {
    doc: DocumentItem
    page?: number
    matches: SearchMatch[]
}

function useDocumentFile(docId: string) {
    return useQuery({
        queryKey: ["document-file", docId],
        queryFn: async () => {
            const res = await API.get(`/documents/${docId}/file`, {
                responseType: "blob",
            })
            return res.data
        },
        enabled: !!docId,
    })
}

export function DocumentPreview({
    doc,
    page = 1,
    matches,
}: Props) {
    const { data: fileBlob, isLoading, error } = useDocumentFile(doc.id)
    const [activeMatchIndex, setActiveMatchIndex] = useState<number | null>(null)
    const [scrollToPage, setScrollToPage] = useState<number | null>(page)
    const [highlightAll, setHighlightAll] = useState(false)

    // Build highlights array from matches
    const highlights: Highlight[] = useMemo(() => {
        return matches.map((m, i) => ({
            text: m.text,
            colorIndex: i % 5,
            isActive: activeMatchIndex === i,
            page: m.page,
        }))
    }, [matches, activeMatchIndex])

    // Handle jump from context panel
    const handleJump = (index: number, page: number, _text: string) => {
        setActiveMatchIndex(index)
        // Force scrollToPage change by temporarily setting to null
        setScrollToPage(null)
        setTimeout(() => setScrollToPage(page), 10)
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 h-full gap-4 p-4">
                <Skeleton className="w-full h-full" />
                <div className="space-y-3">
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-full h-24" />
                </div>
            </div>
        )
    }

    if (error || !fileBlob) {
        return (
            <div className="flex items-center justify-center h-full text-destructive">
                Error loading file
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 h-full overflow-hidden">
            {/* PDF Viewer */}
            <div className="h-full overflow-hidden border-r">
                <PdfViewer
                    file={fileBlob}
                    highlights={highlights}
                    scrollToPage={scrollToPage}
                    highlightAll={highlightAll}
                    onHighlightAllChange={setHighlightAll}
                />
            </div>

            {/* Context Panel */}
            <div className="h-full flex flex-col p-4 gap-4">
                <div className="flex-1 overflow-auto">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        Search Matches ({matches.length})
                    </h3>
                    <DocumentContextPanel
                        matches={matches}
                        activeIndex={activeMatchIndex}
                        onJump={handleJump}
                    />
                </div>
                <DocumentChat docId={doc.id} />
            </div>
        </div>
    )
}