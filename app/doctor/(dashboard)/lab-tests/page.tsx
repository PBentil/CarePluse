
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import type { LabTest, LabTestStatus } from "@/types"

const PAGE_SIZE = 10

const statusStyles: Record<LabTestStatus, string> = {
    ordered:    "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    processing: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    completed:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
}

const filters = [
    { label: "All",        value: "" },
    { label: "Ordered",    value: "ordered" },
    { label: "Processing", value: "processing" },
    { label: "Completed",  value: "completed" },
]

export default function DoctorLabTestsPage() {
    const [labTests, setLabTests]         = useState<LabTest[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchLabTests = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(statusFilter && { status: statusFilter }),
            })
            const res  = await fetch(`/api/doctor/lab-tests?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setLabTests(data.labTests)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => { fetchLabTests() }, [fetchLabTests])

    const columns: Column<LabTest>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        {
            header: "Test",
            accessor: (row) => (
                <span className="text-xs text-zinc-700 dark:text-zinc-200">{row.testName}</span>
            ),
        },
        {
            header: "Ordered",
            accessor: (row) => (
                <span className="text-xs text-zinc-500">
                    {new Date(row.orderedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                    })}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status]}`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: "Results",
            accessor: (row) => row.resultNotes ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{row.resultNotes}</p>
            ) : (
                <span className="text-xs text-zinc-300 dark:text-zinc-600">Pending</span>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Lab Tests ${total > 0 ? `(${total})` : ""}`} />

            <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                            statusFilter === f.value
                                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <DataTable
                data={labTests}
                columns={columns}
                loading={loading}
                emptyMessage="No lab tests ordered yet"
            />

            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
