
"use client"
import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

interface Appointment {
    id: string; date: string; reason: string; status: string; notes?: string
    patient: { fullName: string; email: string; phone: string }
    doctor:  { name: string; specialty: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    pending:     "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    confirmed:   "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    rejected:    "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
    rescheduled: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

const filters = [
    { label: "All", value: "" }, { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" }, { label: "Rejected", value: "rejected" },
]

export default function HospitalAppointmentsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(statusFilter && { status: statusFilter }) })
            const res  = await fetch(`/api/${slug}/admin/appointments?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setAppointments(data.appointments)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, statusFilter])

    useEffect(() => { fetchAppointments() }, [fetchAppointments])

    const columns: Column<Appointment>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.patient.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient.phone}</p>
                </div>
            ),
        },
        {
            header: "Doctor",
            accessor: (row) => (
                <div>
                    <p className="text-zinc-700 dark:text-zinc-200 text-xs">{row.doctor.name}</p>
                    <p className="text-zinc-400 text-xs">{row.doctor.specialty}</p>
                </div>
            ),
        },
        {
            header: "Date",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {new Date(row.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
            ),
        },
        { header: "Reason", accessor: "reason" },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>
                    {row.status}
                </span>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Appointments ${total > 0 ? `(${total})` : ""}`} />
            <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800">
                {filters.map(f => (
                    <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${statusFilter === f.value ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white" : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"}`}>
                        {f.label}
                    </button>
                ))}
            </div>
            <DataTable data={appointments} columns={columns} loading={loading} emptyMessage="No appointments yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
