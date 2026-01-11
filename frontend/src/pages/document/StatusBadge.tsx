import type { DocumentItem } from "@/types/document/documentItem"
import { Badge, Check } from "lucide-react"

export function StatusBadge({ status }: { status: DocumentItem["status"] }) {
  const map = {
    UPLOADED: "gray",
    PROCESSING: "yellow",
    READY: "green",
    ERROR: "red",
  }

  return <Badge color={map[status]}>{status}</Badge>
}
