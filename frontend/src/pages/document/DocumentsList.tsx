import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import type { DocumentItem } from "@/types/document/documentItem"
import { SortHeader } from "@/components/SortHeader/SortHeader"

type DocumentsListProps = {
    files: DocumentItem[]
    sortKey: "name" | "status" | "date"
    sortDir: "asc" | "desc"
    onSortChange: (key: "name" | "status" | "date") => void
}

export function DocumentsList({ files, sortKey, sortDir, onSortChange }: DocumentsListProps) {
    return (
        <div className="flex flex-col text-sm">
            {/* Header */}
            <div className="flex items-center px-3 py-2 text-muted-foreground font-medium">
                <div className="flex-[3]">
                    <SortHeader
                        label="Name"
                        active={sortKey === "name"}
                        dir={sortDir}
                        onClick={() => onSortChange("name")}
                    />
                </div>
                <div className="flex-1">
                    <SortHeader
                        label="Status"
                        active={sortKey === "status"}
                        dir={sortDir}
                        onClick={() => onSortChange("status")}
                    />
                </div>
                <div className="flex-1">
                    <SortHeader
                        label="Date"
                        active={sortKey === "date"}
                        dir={sortDir}
                        onClick={() => onSortChange("date")}
                    />
                </div>
            </div>

            <div className="border-b" />

            {/* Rows */}
            {files.map((doc, i) => (
                <div
                    key={doc.id}
                    // onClick={() => onSelect?.(doc)}
                    className={cn(
                        "flex items-center px-3 py-2 rounded-md cursor-pointer",
                        "hover:bg-muted transition-colors",
                        (i % 2 === 0) && "bg-muted/30"
                    )}
                >
                    <div className="flex-[3] flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                    </div>

                    <div className="flex-1">
                        <StatusBadge status={doc.status} />
                    </div>

                    <div className="flex-1 text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    )
}