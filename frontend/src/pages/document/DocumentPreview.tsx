import { useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
import type { DocumentItem, SearchMatch } from "@/types/document/documentItem"
import { useQuery } from "@tanstack/react-query"
import API from "@/services/APIService"
import { DocumentContextPanel } from "./DocumentContextPanel"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString()

type Props = {
    doc: DocumentItem
    page?: number
    matches: SearchMatch[]
    onJump: (page: number) => void
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
    onJump,
}: Props) {
    const { data: fileBlob, isLoading, error } = useDocumentFile(doc.id)
    const objectUrl = useMemo(() => {
        if (!fileBlob) return null
        return URL.createObjectURL(fileBlob)
    }, [fileBlob])

    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
            console.log(objectUrl)
        }
    }, [objectUrl])

    if (isLoading) return <p>Loading…</p>
    if (error || !objectUrl) return <p>Error loading file</p>

    return (
        <div className="grid grid-cols-2 h-full">
            <iframe
                key={page}
                src={`${objectUrl}#page=${page}`}
                className="w-full h-full border-0"
            />

            {/* Context */}
            <div className="overflow-auto p-4 space-y-6">
                <DocumentContextPanel
                    matches={matches}
                    onJump={onJump}
                />
                {/* <AISummary docId={doc.id} /> */}
            </div>
        </div>
    )
}