
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"
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

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export default function AdminLabTestsPage() {
    const [labTests, setLabTests]         = useState<LabTest[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)
    const [selected, setSelected]         = useState<LabTest | null>(null)
    const [resultNotes, setResultNotes]   = useState("")
    const [resultUrl, setResultUrl]       = useState("")
    const [saving, setSaving]             = useState(false)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchLabTests = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(statusFilter && { status: statusFilter }),
            })
            const res  = await fetch(`/api/admin/lab-tests?${params}`)
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

    const handleUploadResults = async (status: LabTestStatus) => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/lab-tests/${selected.id}`, {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ status, resultNotes, resultUrl }),
            })
            if (!res.ok) throw new Error("Failed to update")
            toast.success(status === "completed" ? "Results uploaded — patient notified" : "Status updated")
            setSelected(null)
            setResultNotes("")
            setResultUrl("")
            fetchLabTests()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

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
            header: "Doctor",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{row.doctor?.name}</span>
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
            header: "",
            accessor: (row) => (
                <button
                    onClick={() => { setSelected(row); setResultNotes(row.resultNotes ?? ""); setResultUrl(row.resultUrl ?? "") }}
                    className="text-xs text-primary hover:underline"
                >
                    Update
                </button>
            ),
            className: "w-20",
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
                emptyMessage="No lab tests found"
            />

            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Update Lab Test" size="sm">
                {selected && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-1">
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{selected.testName}</p>
                            <p className="text-xs text-zinc-400">{selected.patient?.fullName}</p>
                        </div>

                        <div>
                            <label className={labelClass}>Result notes</label>
                            <textarea
                                value={resultNotes}
                                onChange={e => setResultNotes(e.target.value)}
                                placeholder="Describe the findings..."
                                rows={4}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Result file URL</label>
                            <input
                                value={resultUrl}
                                onChange={e => setResultUrl(e.target.value)}
                                placeholder="https://..."
                                className={inputClass}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => handleUploadResults("processing")}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Mark processing
                            </button>
                            <button
                                onClick={() => handleUploadResults("completed")}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Upload results
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
