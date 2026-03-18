"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export interface Column<T> {
    header: string
    accessor: keyof T | ((row: T) => React.ReactNode)
    className?: string
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    loading?: boolean
    searchKeys?: (keyof T)[]
    searchPlaceholder?: string
    title?: string
    emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
                                                        data,
                                                        columns,
                                                        loading = false,
                                                        searchKeys = [],
                                                        searchPlaceholder = "Search...",
                                                        title,
                                                        emptyMessage = "No records found",
                                                    }: DataTableProps<T>) {
    const [search, setSearch] = useState("")

    const filtered = data.filter((row) =>
        searchKeys.length === 0
            ? true
            : searchKeys.some((key) =>
                String(row[key]).toLowerCase().includes(search.toLowerCase())
            )
    )

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">

            {(title || searchKeys.length > 0) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    {title && (
                        <h2 className="text-sm font-medium text-zinc-900 dark:text-white">
                            {title}
                        </h2>
                    )}

                    {searchKeys.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="pl-8 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all w-56"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`text-left px-6 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide ${col.className ?? ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-zinc-50 dark:border-zinc-800/50">
                                {columns.map((_, j) => (
                                    <td key={j} className="px-6 py-4">
                                        <div className="h-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse w-24" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-sm text-zinc-400"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        filtered.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                            >
                                {columns.map((col, j) => (
                                    <td key={j} className={`px-6 py-4 text-zinc-600 dark:text-zinc-300 ${col.className ?? ""}`}>
                                        {typeof col.accessor === "function"
                                            ? col.accessor(row)
                                            : String(row[col.accessor] ?? "—")}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

        </div>
    )
}