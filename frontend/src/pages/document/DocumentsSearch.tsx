export function DocumentsSearch({
  value,
  onChange,
  onSearch,
  loading,
}: {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
  loading: boolean
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search documents..."
        className="flex-1 rounded-md border px-3 py-2 text-sm"
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className="rounded-md bg-primary px-4 py-2 text-white"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </div>
  )
}
