
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

interface Order {
    id: string; status: string; deliveryAddress: string; totalAmount: number; createdAt: string
    patient?: { fullName: string; phone: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    packed:     "bg-amber-50 text-amber-600",
    on_the_way: "bg-blue-50 text-blue-600",
    delivered:  "bg-emerald-50 text-emerald-600",
}
const statusLabels: Record<string, string> = { packed: "Packed", on_the_way: "On the way", delivered: "Delivered" }

export default function StaffOrdersPage() {
    const { slug } = useParams<{ slug: string }>()
    const [orders, setOrders]   = useState<Order[]>([])
    const [total, setTotal]     = useState(0)
    const [page, setPage]       = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/admin/orders?page=${page}&limit=${PAGE_SIZE}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setOrders(data.orders); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const columns: Column<Order>[] = [
        { header: "Order ID", accessor: (row) => <span className="text-xs font-mono text-zinc-600">#{row.id.slice(0, 8).toUpperCase()}</span> },
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        { header: "Address", accessor: (row) => <span className="text-xs text-zinc-600">{row.deliveryAddress}</span> },
        { header: "Total", accessor: (row) => <span className="text-xs font-medium text-zinc-900">GH₵ {row.totalAmount.toFixed(2)}</span> },
        {
            header: "Status",
            accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${statusStyles[row.status] ?? ""}`}>{statusLabels[row.status] ?? row.status}</span>,
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Orders ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={orders} columns={columns} loading={loading} emptyMessage="No orders yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
