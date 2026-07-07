
"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Truck, CheckCircle2, Package } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"

interface Order {
    id: string; status: string; deliveryAddress: string; totalAmount: number; createdAt: string
    patient?: { fullName: string; phone: string }
    prescription?: { items: { id: string; drugName: string; dosage: string }[] }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    packed:     "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    on_the_way: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    delivered:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
}
const statusLabels: Record<string, string> = { packed: "Packed", on_the_way: "On the way", delivered: "Delivered" }
const filters = [
    { label: "All", value: "" }, { label: "Packed", value: "packed" },
    { label: "On the way", value: "on_the_way" }, { label: "Delivered", value: "delivered" },
]

export default function HospitalOrdersPage() {
    const { slug } = useParams<{ slug: string }>()
    const [orders, setOrders]             = useState<Order[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)
    const [selected, setSelected]         = useState<Order | null>(null)
    const [saving, setSaving]             = useState(false)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(statusFilter && { status: statusFilter }) })
            const res  = await fetch(`/api/${slug}/admin/orders?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setOrders(data.orders); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, statusFilter])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const handleUpdate = async (status: string) => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/${slug}/admin/orders/${selected.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Order updated — patient notified")
            setSelected(null); fetchOrders()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const columns: Column<Order>[] = [
        { header: "Order ID", accessor: (row) => <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">#{row.id.slice(0, 8).toUpperCase()}</span> },
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        { header: "Address", accessor: (row) => <span className="text-xs text-zinc-600 dark:text-zinc-300">{row.deliveryAddress}</span> },
        { header: "Total", accessor: (row) => <span className="text-xs font-medium text-zinc-900 dark:text-white">GH₵ {row.totalAmount.toFixed(2)}</span> },
        {
            header: "Status",
            accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${statusStyles[row.status] ?? ""}`}>{statusLabels[row.status] ?? row.status}</span>,
        },
        {
            header: "",
            accessor: (row) => <button onClick={() => setSelected(row)} className="text-xs text-primary hover:underline">Update</button>,
            className: "w-16",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Orders ${total > 0 ? `(${total})` : ""}`} />
            <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800">
                {filters.map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${statusFilter === f.value ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white" : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}>{f.label}</button>
                ))}
            </div>
            <DataTable data={orders} columns={columns} loading={loading} emptyMessage="No orders yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Update Order" size="sm">
                {selected && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-2">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{selected.patient?.fullName}</p>
                            <p className="text-xs text-zinc-400">{selected.deliveryAddress}</p>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">GH₵ {selected.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="space-y-2">
                            {selected.status === "packed" && (
                                <button onClick={() => handleUpdate("on_the_way")} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                                    <Truck className="h-4 w-4" /> Mark as on the way
                                </button>
                            )}
                            {selected.status === "on_the_way" && (
                                <button onClick={() => handleUpdate("delivered")} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                                    <CheckCircle2 className="h-4 w-4" /> Mark as delivered
                                </button>
                            )}
                            {selected.status === "delivered" && (
                                <div className="flex items-center justify-center gap-2 py-4 text-emerald-600">
                                    <Package className="h-5 w-5" />
                                    <p className="text-sm font-medium">Order completed</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
