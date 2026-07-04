
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"
import type { Prescription, PrescriptionStatus } from "@/types"

const PAGE_SIZE = 10

const statusStyles: Record<PrescriptionStatus, string> = {
    pending:   "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    paid:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    dispensed: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

const filters = [
    { label: "All",       value: "" },
    { label: "Pending",   value: "pending" },
    { label: "Paid",      value: "paid" },
    { label: "Dispensed", value: "dispensed" },
]

export default function AdminPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [total, setTotal]                 = useState(0)
    const [page, setPage]                   = useState(1)
    const [statusFilter, setStatusFilter]   = useState("")
    const [loading, setLoading]             = useState(true)
    const [selected, setSelected]           = useState<Prescription | null>(null)
    const [saving, setSaving]               = useState(false)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(statusFilter && { status: statusFilter }),
            })
            const res  = await fetch(`/api/admin/prescriptions?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setPrescriptions(data.prescriptions)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    const handleStatusUpdate = async (status: PrescriptionStatus) => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/prescriptions/${selected.id}`, {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error("Failed to update")
            toast.success("Prescription updated")
            setSelected(null)
            fetchPrescriptions()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    const columns: Column<Prescription>[] = [
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
            header: "Doctor",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{row.doctor?.name}</span>
            ),
        },
        {
            header: "Drugs",
            accessor: (row) => (
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {row.items.map(i => i.drugName).join(", ")}
                </p>
            ),
        },
        {
            header: "Total",
            accessor: (row) => (
                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                    GH₵ {row.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
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
                    onClick={() => setSelected(row)}
                    className="text-xs text-primary hover:underline"
                >
                    View
                </button>
            ),
            className: "w-16",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Prescriptions ${total > 0 ? `(${total})` : ""}`} />

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
                data={prescriptions}
                columns={columns}
                loading={loading}
                emptyMessage="No prescriptions yet"
            />

            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Prescription Details" size="sm">
                {selected && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selected.patient?.fullName}</p>
                                <p className="text-xs text-zinc-400">Dr. {selected.doctor?.name}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[selected.status]}`}>
                                {selected.status}
                            </span>
                        </div>

                        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800">
                            {selected.items.map(item => (
                                <div key={item.id} className="px-4 py-3 flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {item.drugName} <span className="text-zinc-400 font-normal">{item.dosage}</span>
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {item.frequency} · {item.duration}
                                            {item.notes && ` · ${item.notes}`}
                                        </p>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 shrink-0 ml-4">
                                        GH₵ {item.price.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                            <div className="px-4 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                                <p className="text-xs font-medium text-zinc-500">Total</p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                    GH₵ {selected.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {selected.notes && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">{selected.notes}</p>
                        )}

                        <div className="flex gap-2 pt-2">
                            {selected.status === "paid" && (
                                <button
                                    onClick={() => handleStatusUpdate("dispensed")}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                                >
                                    Mark dispensed
                                </button>
                            )}
                            {selected.status === "pending" && (
                                <button
                                    onClick={() => handleStatusUpdate("paid")}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                                >
                                    Mark as paid
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
