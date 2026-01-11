import { Check, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/types/document/documentItem"

const statusStyles = {
    UPLOADED: "bg-gray-200 text-gray-800 hover:bg-gray-200",
    PROCESSING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    READY: "bg-green-100 text-green-800 hover:bg-green-100",
    ERROR: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function DocumentCard({ doc, onPreview }:
    {
        doc: DocumentItem,
        onPreview: (
            doc: DocumentItem,
            options?: { page?: number; highlight?: string }
        ) => void
    }) {
    return (
        <Card>
            <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 truncate ">
                        <p className="text-sm font-medium truncate">
                            {doc.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {((doc?.size ?? 0) / 1024).toFixed(1)} KB
                        </p>
                        <Badge className={statusStyles[doc.status] + " mt-2"}>
                            <Check className="inline-block mr-1 h-4 w-4" /> {doc.status}
                        </Badge>
                    </div>
                </div>

                {/* Search brief */}
                {doc.matches?.[0] && (
                    <button
                        onClick={() =>
                            onPreview(doc, {
                                page: doc.matches ? doc.matches[0].page : -1,
                                highlight: doc.matches ? doc.matches[0].text : '',
                            })
                        }
                        className="mt-2 block rounded bg-muted p-2 text-xs text-left"
                    >
                        Occurrence in page {doc.matches[0].page}
                    </button>
                )}

                
                {/* Preview button */}
                        <button
                            onClick={() => onPreview(doc)}
                            className="w-full p-2 rounded-md bg-primary text-white shadow"
                        >
                            Ver
                        </button>
            </CardContent>
        </Card>
    )
}
