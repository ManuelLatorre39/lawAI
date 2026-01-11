import { useEffect, useMemo, useState } from "react"
import { UploadCloud, LayoutGrid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet"

import API from "@/services/APIService"
import { socket } from "@/services/socket"
import type { DocumentItem, SearchMatch, SearchResult } from "@/types/document/documentItem"
import { DocumentsList } from "./DocumentsList"
import { DocumentsGrid } from "./DocumentsGrid"
import { DocumentsSearch } from "./DocumentsSearch"
import { DocumentPreview } from "./DocumentPreview"

type ViewMode = "grid" | "list"
type SortKey = "name" | "status" | "date"
type SortDir = "asc" | "desc"

export function DocumentsPage() {
    const [files, setFiles] = useState<DocumentItem[]>([])
    const [uploading, setUploading] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [sortKey, setSortKey] = useState<SortKey>("date")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<DocumentItem[] | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)
    const [previewPage, setPreviewPage] = useState<number | null>(null)
    const [previewMatches, setPreviewMatches] = useState<SearchMatch[]>([])

    const visibleDocs = searchResults ?? files

    // Load existing documents
    useEffect(() => {
        API.get("/documents").then((res) => {
            setFiles(res.data)
        })
    }, [])

    async function runSearch(q: string) {
        if (!q.trim()) {
            setSearchResults(null)
            return
        }

        setIsSearching(true)

        const res = await API.get("/documents/search", {
            params: { q },
        })

        const results: SearchResult[] = res.data.results

        const enrichedDocs = results
            .map((result) => {
                const doc = files.find((f) => f.id === result.document_id)
                if (!doc) return null

                return {
                    ...doc,
                    matches: result.matches,
                }
            })
            .filter(Boolean) as DocumentItem[]

        setSearchResults(enrichedDocs)

        setIsSearching(false)
    }

    // Listen to async status updates
    useEffect(() => {
        socket.on("document:status", ({ id, status }) => {
            setFiles((prev) =>
                prev.map((doc) =>
                    doc.id === id ? { ...doc, status } : doc
                )
            )
        })

        return () => {
            socket.off("document:status")
        }
    }, [])

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        setUploading(true)

        const res = await API.post(
            "/documents/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )

        setFiles((prev) => [res.data, ...prev])
        setUploading(false)
    }

    const openPreview = (
        doc: DocumentItem,
    ) => {
        const match = doc.matches?.[0]

        setPreviewDoc(doc)
        setPreviewPage(match ? match.page : null)
        setPreviewMatches(doc.matches ? doc.matches : [])
        // setHighlightText(match ? match.text.slice(0, 80) : '')
    }

    const sortedDocs = useMemo(() => {
        return [...visibleDocs].sort((a, b) => {
            let res = 0

            if (sortKey === "name") {
                res = a.filename.localeCompare(b.filename)
            }

            if (sortKey === "date") {
                res =
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            }

            if (sortKey === "status") {
                res = a.status.localeCompare(b.status)
            }

            return sortDir === "asc" ? res : -res
        })
    }, [visibleDocs, sortKey, sortDir])

    return (
        <div className="space-y-6">
            {/* Preview panel */}
            <Sheet open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <SheetContent side="right" className="w-[150vh] h-screen p-0 pt-10" aria-describedby={undefined}>
                    <SheetTitle className="sr-only">
                        {previewDoc?.filename ?? "Document Preview"}
                    </SheetTitle>
                    {previewDoc && (
                        <DocumentPreview
                            doc={previewDoc}
                            page={previewPage ?? 1}
                            matches={previewMatches}
                        />
                    )}
                </SheetContent>
            </Sheet>

            {/* Upload */}
            <Card>
                <CardContent className="p-6">
                    <label className="flex cursor-pointer items-center gap-4 rounded-md border border-dashed p-6 hover:bg-muted">
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-medium">Upload document</p>
                            <p className="text-sm text-muted-foreground">
                                PDF or TXT, processed asynchronously
                            </p>
                        </div>

                        <input
                            type="file"
                            accept=".pdf,.txt"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleUpload(e.target.files[0])
                                }
                            }}
                        />
                    </label>

                    {uploading && <Progress className="mt-4" />}
                </CardContent>
            </Card>

            <div className="flex gap-2">
                <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>

                <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>

            <DocumentsSearch
                value={query}
                onChange={setQuery}
                onSearch={() => runSearch(query)}
                loading={isSearching}
            />

            {isSearching && <p className="text-sm text-muted-foreground">Searching…</p>}

            {viewMode === "grid" ? (
                <DocumentsGrid files={sortedDocs} onPreview={openPreview} />
            ) : (
                <DocumentsList
                    files={sortedDocs}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSortChange={(key) => {
                        if (key === sortKey) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                        } else {
                            setSortKey(key)
                            setSortDir("asc")
                        }
                    }}
                // onPreview={openPreview}
                />
            )}

        </div>
    )
}
