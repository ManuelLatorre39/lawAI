import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/types/document/documentItem"

const statusStyles = {
    UPLOADED: "bg-gray-200 text-gray-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    READY: "bg-green-100 text-green-800",
    ERROR: "bg-red-100 text-red-800",
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
                    <div className="flex-1 truncate">
                        <p className="text-sm font-medium truncate">
                            {doc.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {((doc?.size ?? 0) / 1024).toFixed(1)} KB
                        </p>
                        {/* Preview button */}
                        <button
                            onClick={() => onPreview(doc)}
                            className="right-2 top-2 rounded-md bg-background shadow"
                        >
                            View
                        </button>
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

                <Badge className={cn("w-fit", statusStyles[doc.status])}>
                    {doc.status}
                </Badge>
            </CardContent>
        </Card>
    )
}
