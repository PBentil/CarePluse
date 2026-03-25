import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    page: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
}

export function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(total / pageSize)
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
            acc.push(p)
            return acc
        }, [])

    return (
        <div className="flex items-center justify-between px-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-zinc-400">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                                page === p
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                                    : "border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(Math.ceil(total / pageSize), page + 1))}
                    disabled={page === Math.ceil(total / pageSize)}
                    className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}