
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

interface LabTest {
    id: string; testName: string; status: string; orderedAt: string; resultNotes?: string
    patient?: { fullName: string; phone: string }
    doctor?:  { name: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    ordered:    "bg-amber-50 text-amber-600",
    processing: "bg-blue-50 text-blue-600",
    completed:  "bg-emerald-50 text-emerald-600",
}

export default function StaffLabTestsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [labTests, setLabTests] = useState<LabTest[]>([])
    const [total, setTotal]       = useState(0)
    const [page, setPage]         = useState(1)
    const [loading, setLoading]   = useState(true)

    const fetchLabTests = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/admin/lab-tests?page=${page}&limit=${PAGE_SIZE}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setLabTests(data.labTests)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page])

    useEffect(() => { fetchLabTests() }, [fetchLabTests])

    const columns: Column<LabTest>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        { header: "Test", accessor: (row) => <span className="text-xs text-zinc-700">{row.testName}</span> },
        { header: "Doctor", accessor: (row) => <span className="text-xs text-zinc-500">{row.doctor?.name}</span> },
        {
            header: "Date",
            accessor: (row) => <span className="text-xs text-zinc-500">{new Date(row.orderedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>,
        },
        {
            header: "Status",
            accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>{row.status}</span>,
        },
        {
            header: "Results",
            accessor: (row) => row.resultNotes
                ? <p className="text-xs text-zinc-500 truncate max-w-xs">{row.resultNotes}</p>
                : <span className="text-xs text-zinc-300">Pending</span>,
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Lab Tests ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={labTests} columns={columns} loading={loading} emptyMessage="No lab tests yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
