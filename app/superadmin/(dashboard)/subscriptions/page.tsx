
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

interface Subscription {
    id: string; plan: string; status: string; amount: number
    currentPeriodStart: string; currentPeriodEnd: string
    hospital: { name: string; slug: string; email: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    active:   "bg-emerald-50 text-emerald-600",
    expired:  "bg-red-50 text-red-500",
    cancelled:"bg-zinc-100 text-zinc-500",
}
const planColors: Record<string, string> = {
    starter:    "bg-blue-50 text-blue-600",
    growth:     "bg-purple-50 text-purple-600",
    enterprise: "bg-amber-50 text-amber-600",
}
const filters = [
    { label: "All", value: "" },
    { label: "Starter", value: "starter" },
    { label: "Growth", value: "growth" },
    { label: "Enterprise", value: "enterprise" },
]

export default function SuperAdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [total, setTotal]                 = useState(0)
    const [totalMRR, setTotalMRR]           = useState(0)
    const [page, setPage]                   = useState(1)
    const [planFilter, setPlanFilter]       = useState("")
    const [loading, setLoading]             = useState(true)

    useEffect(() => { setPage(1) }, [planFilter])

    const fetchSubscriptions = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(planFilter && { plan: planFilter }) })
            const res  = await fetch(`/api/superadmin/subscriptions?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSubscriptions(data.subscriptions)
            setTotal(data.total)
            setTotalMRR(data.totalMRR)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [page, planFilter])

    useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])

    const columns: Column<Subscription>[] = [
        {
            header: "Hospital",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.hospital.name}</p>
                    <p className="text-zinc-400 text-xs">{row.hospital.email}</p>
                </div>
            ),
        },
        {
            header: "Plan",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${planColors[row.plan] ?? ""}`}>
                    {row.plan}
                </span>
            ),
        },
        {
            header: "Amount",
            accessor: (row) => <span className="text-xs font-medium text-zinc-900">GH₵ {row.amount.toLocaleString()}/mo</span>,
        },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: "Renewal",
            accessor: (row) => (
                <span className="text-xs text-zinc-500">
                    {new Date(row.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <PageHeader title={`Subscriptions ${total > 0 ? `(${total})` : ""}`} />
                <div className="bg-zinc-900 rounded-2xl px-6 py-4 text-white text-right">
                    <p className="text-xs text-zinc-400">Total MRR</p>
                    <p className="text-2xl font-bold">GH₵ {totalMRR.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex items-center gap-1 border-b border-zinc-100">
                {filters.map(f => (
                    <button key={f.value} onClick={() => setPlanFilter(f.value)} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${planFilter === f.value ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            <DataTable data={subscriptions} columns={columns} loading={loading} emptyMessage="No subscriptions yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
