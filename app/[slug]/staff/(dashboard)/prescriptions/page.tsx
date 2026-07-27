
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"

interface PrescriptionItem { id: string; drugName: string; dosage: string; frequency: string; duration: string; price: number }
interface Prescription {
    id: string; status: string; createdAt: string
    patient?: { fullName: string; phone: string }
    doctor?:  { name: string }
    items:    PrescriptionItem[]
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    pending:   "bg-amber-50 text-amber-600",
    paid:      "bg-emerald-50 text-emerald-600",
    dispensed: "bg-blue-50 text-blue-600",
}

export default function StaffPrescriptionsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [total, setTotal]                 = useState(0)
    const [page, setPage]                   = useState(1)
    const [loading, setLoading]             = useState(true)
    const [selected, setSelected]           = useState<Prescription | null>(null)
    const [saving, setSaving]               = useState(false)

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/admin/prescriptions?page=${page}&limit=${PAGE_SIZE}&status=paid`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setPrescriptions(data.prescriptions)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    const handleDispense = async () => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/${slug}/admin/prescriptions/${selected.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "dispensed" }),
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Prescription marked as dispensed")
            setSelected(null)
            fetchPrescriptions()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const columns: Column<Prescription>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        { header: "Doctor", accessor: (row) => <span className="text-xs text-zinc-500">{row.doctor?.name}</span> },
        { header: "Drugs", accessor: (row) => <p className="text-xs text-zinc-600">{row.items.map(i => i.drugName).join(", ")}</p> },
        { header: "Total", accessor: (row) => <span className="text-xs font-medium text-zinc-900">GH₵ {row.items.reduce((s, i) => s + i.price, 0).toFixed(2)}</span> },
        {
            header: "Status",
            accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>{row.status}</span>,
        },
        {
            header: "",
            accessor: (row) => row.status === "paid"
                ? <button onClick={() => setSelected(row)} className="text-xs text-primary hover:underline">Dispense</button>
                : null,
            className: "w-20",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Prescriptions to dispense ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={prescriptions} columns={columns} loading={loading} emptyMessage="No paid prescriptions to dispense" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Dispense Prescription" size="sm">
                {selected && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-50 p-4 space-y-2">
                            <p className="text-sm font-medium text-zinc-900">{selected.patient?.fullName}</p>
                            <p className="text-xs text-zinc-400">Dr. {selected.doctor?.name}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                            {selected.items.map(item => (
                                <div key={item.id} className="px-4 py-3 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">{item.drugName} <span className="text-zinc-400 font-normal">{item.dosage}</span></p>
                                        <p className="text-xs text-zinc-400">{item.frequency} · {item.duration}</p>
                                    </div>
                                    <p className="text-sm text-zinc-600">GH₵ {item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleDispense} disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving ? "Processing..." : "Confirm dispensed"}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}
