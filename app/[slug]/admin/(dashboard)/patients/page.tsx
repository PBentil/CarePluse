
"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { ConfirmModal } from "@/components/admin/confirm-modal"

interface Patient {
    id: string; fullName: string; email: string; phone: string; gender?: string; createdAt: string
}

const PAGE_SIZE = 10

export default function HospitalPatientsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [patients, setPatients]   = useState<Patient[]>([])
    const [total, setTotal]         = useState(0)
    const [page, setPage]           = useState(1)
    const [search, setSearch]       = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]     = useState(true)
    const [deleteId, setDeleteId]   = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(debouncedSearch && { search: debouncedSearch }) })
            const res  = await fetch(`/api/${slug}/admin/patients?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setPatients(data.patients)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, debouncedSearch])

    useEffect(() => { fetchPatients() }, [fetchPatients])

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleteLoading(true)
        try {
            await fetch(`/api/${slug}/admin/patients/${deleteId}`, { method: "DELETE" })
            toast.success("Patient deleted")
            setDeleteId(null)
            fetchPatients()
        } catch { toast.error("Failed to delete") } finally { setDeleteLoading(false) }
    }

    const columns: Column<Patient>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
                        {row.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-white text-xs">{row.fullName}</span>
                </div>
            ),
        },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        {
            header: "Gender",
            accessor: (row) => row.gender
                ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">{row.gender}</span>
                : <span className="text-zinc-300 dark:text-zinc-600">—</span>,
        },
        {
            header: "Registered",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Patients ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={patients} columns={columns} loading={loading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email or phone..." emptyMessage="No patients yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleteLoading} title="Delete Patient" description="Are you sure? This cannot be undone." confirmLabel="Delete" />
        </div>
    )
}
