
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { Modal } from "@/components/admin/modal"

interface Hospital {
    id: string; name: string; slug: string; email: string; plan: string
    subscriptionStatus: string; createdAt: string
    _count: { doctors: number; patients: number; appointments: number }
    subscription?: { amount: number; currentPeriodEnd: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    active:  "bg-emerald-50 text-emerald-600",
    trial:   "bg-amber-50 text-amber-600",
    expired: "bg-red-50 text-red-500",
}

export default function SuperAdminHospitalsPage() {
    const [hospitals, setHospitals]       = useState<Hospital[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [search, setSearch]             = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]           = useState(true)
    const [selected, setSelected]         = useState<Hospital | null>(null)
    const [saving, setSaving]             = useState(false)

    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t) }, [search])
    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchHospitals = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(debouncedSearch && { search: debouncedSearch }) })
            const res  = await fetch(`/api/superadmin/hospitals?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setHospitals(data.hospitals); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [page, debouncedSearch])

    useEffect(() => { fetchHospitals() }, [fetchHospitals])

    const handleStatusUpdate = async (status: string) => {
        if (!selected) return
        setSaving(true)
        try {
            const res = await fetch(`/api/superadmin/hospitals/${selected.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error("Failed")
            toast.success(`Hospital ${status === "active" ? "activated" : "suspended"}`)
            setSelected(null); fetchHospitals()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setSaving(false) }
    }

    const columns: Column<Hospital>[] = [
        {
            header: "Hospital",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 text-xs">{row.name}</p>
                    <p className="text-zinc-400 text-xs">/{row.slug}</p>
                </div>
            ),
        },
        { header: "Email", accessor: (row) => <span className="text-xs text-zinc-500">{row.email}</span> },
        {
            header: "Plan",
            accessor: (row) => <span className="text-xs font-medium text-zinc-700 capitalize">{row.plan}</span>,
        },
        {
            header: "Stats",
            accessor: (row) => (
                <div className="text-xs text-zinc-500 space-y-0.5">
                    <p>{row._count.doctors} doctors · {row._count.patients} patients</p>
                    <p>{row._count.appointments} appointments</p>
                </div>
            ),
        },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.subscriptionStatus] ?? ""}`}>
                    {row.subscriptionStatus}
                </span>
            ),
        },
        {
            header: "Joined",
            accessor: (row) => <span className="text-xs text-zinc-400">{new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>,
        },
        {
            header: "",
            accessor: (row) => (
                <button onClick={() => setSelected(row)} className="text-xs text-primary hover:underline">Manage</button>
            ),
            className: "w-16",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Hospitals ${total > 0 ? `(${total})` : ""}`} />
            <DataTable data={hospitals} columns={columns} loading={loading} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email or slug..." emptyMessage="No hospitals yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Hospital" size="sm">
                {selected && (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-zinc-50 p-4 space-y-2">
                            <p className="text-sm font-medium text-zinc-900">{selected.name}</p>
                            <p className="text-xs text-zinc-400">{selected.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 capitalize">{selected.plan} plan</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[selected.subscriptionStatus] ?? ""}`}>
                                    {selected.subscriptionStatus}
                                </span>
                            </div>
                            <div className="text-xs text-zinc-400 space-y-0.5">
                                <p>{selected._count.doctors} doctors · {selected._count.patients} patients</p>
                                <p>{selected._count.appointments} appointments</p>
                                {selected.subscription && (
                                    <p>Revenue: GH₵ {selected.subscription.amount.toLocaleString()}/mo</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <a href={`/${selected.slug}/admin/login`} target="_blank" rel="noopener noreferrer" className="text-center px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">
                                Open hospital portal ↗
                            </a>
                            {selected.subscriptionStatus !== "active" && (
                                <button onClick={() => handleStatusUpdate("active")} disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                                    Activate subscription
                                </button>
                            )}
                            {selected.subscriptionStatus === "active" && (
                                <button onClick={() => handleStatusUpdate("expired")} disabled={saving} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                                    Suspend hospital
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
