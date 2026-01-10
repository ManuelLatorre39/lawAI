export function SortHeader({
    label,
    active,
    dir,
    onClick,
}: {
    label: string
    active: boolean
    dir: "asc" | "desc"
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 hover:underline"
        >
            {label}
            {active && (dir === "asc" ? "▲" : "▼")}
        </button>
    )
}