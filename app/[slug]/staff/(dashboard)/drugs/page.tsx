
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

interface Drug { id: string; name: string; genericName?: string; category?: string; unit: string; price: number; inStock: boolean }

const PAGE_SIZE = 10

export default function StaffDrugsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [drugs, setDrugs]   = useState<Drug[]>([])
    const [total, setTotal]   = useState(0)
    const [page, setPage]     = useState(1)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t) }, [search])
    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchDrugs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(debouncedSearch && { search: debouncedSearch }) })
            const res  = await fetch(`/api/${slug}/admin/drugs?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setDrugs(data.drugs); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, debouncedSearch])

    useEffect(() => { fetchDrugs() }, [fetchDrugs])

    const toggleStock = async (drug: Drug) => {
        try {
            await fetch(`/api/${slug}/admin/drugs/${drug.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...drug, inStock: !drug.inStock }),
            })
            toast.success(`${drug.name} marked as ${!drug.inStock ? "in stock" : "out of stock"}`)
            fetchDrugs()
        } catch { toast.error("Failed to update") }
    }

    const columns: Column<Drug>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.name}</p>
                    {row.genericName && <p className="text-zinc-400 text-xs">{row.genericName}</p>}
                </div>
            ),
        },
        { header: "Category", accessor: (row) => <span className="text-xs text-zinc-500">{row.category ?? "—"}</span> },
        { header: "Unit", accessor: (row) => <span className="text-xs text-zinc-500">{row.unit}</span> },
        { header: "Price", accessor: (row) => <span className="text-xs font-medium text-zinc-900">GH₵ {row.price.toFixed(2)}</span> },
        {
            header: "Stock",
            accessor: (row) => (
                <button onClick={() => toggleStock(row)} className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium transition-colors ${row.inStock ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                    {row.inStock ? "In stock" : "Out of stock"}
                </button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Drug Catalogue ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={drugs} columns={columns} loading={loading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search drugs..." emptyMessage="No drugs yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
