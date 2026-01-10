import type { DocumentItem } from "@/types/document/documentItem";
import { DocumentCard } from "./DocumentCard";


export function DocumentsGrid({ files, onPreview }: {
    files: DocumentItem[],
    onPreview: (
        doc: DocumentItem,
        options?: { page?: number; highlight?: string }
    ) => void
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onPreview={onPreview} />
            ))}
        </div>
    )
}