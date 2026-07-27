
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Video, XCircle, Loader2 } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { ConfirmModal } from "@/components/admin/confirm-modal"

interface Appointment {
    id: string; date: string; reason: string; status: string
    rescheduledDate?: string; videoRoomName?: string; rejectionReason?: string
    doctor: { name: string; specialty: string }
}

const PAGE_SIZE = 10
const statusStyles: Record<string, string> = {
    pending:     "bg-amber-50 text-amber-600",
    confirmed:   "bg-emerald-50 text-emerald-600",
    rejected:    "bg-red-50 text-red-500",
    rescheduled: "bg-blue-50 text-blue-600",
    cancelled:   "bg-zinc-100 text-zinc-500",
    completed:   "bg-purple-50 text-purple-600",
}
const filters = [
    { label: "All", value: "" }, { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" }, { label: "Rescheduled", value: "rescheduled" },
    { label: "Rejected", value: "rejected" },
]

export default function PatientAppointmentsPage() {
    const { slug } = useParams<{ slug: string }>()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [total, setTotal]               = useState(0)
    const [page, setPage]                 = useState(1)
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading]           = useState(true)
    const [cancelId, setCancelId]         = useState<string | null>(null)
    const [cancelling, setCancelling]     = useState(false)

    useEffect(() => { setPage(1) }, [statusFilter])

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(statusFilter && { status: statusFilter }) })
            const res  = await fetch(`/api/${slug}/patient/appointments?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setAppointments(data.appointments); setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug, page, statusFilter])

    useEffect(() => { fetchAppointments() }, [fetchAppointments])

    const handleCancel = async () => {
        if (!cancelId) return
        setCancelling(true)
        try {
            const res = await fetch(`/api/${slug}/patient/appointments/${cancelId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel" }),
            })
            if (!res.ok) throw new Error("Failed to cancel")
            toast.error("Appointment cancelled")
            setCancelId(null)
            fetchAppointments()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setCancelling(false) }
    }

    const columns: Column<Appointment>[] = [
        { header: "Doctor", accessor: (row) => (<div><p className="font-medium text-zinc-900 text-xs">{row.doctor.name}</p><p className="text-zinc-400 text-xs">{row.doctor.specialty}</p></div>) },
        { header: "Date", accessor: (row) => <span className="text-xs text-zinc-600">{new Date(row.rescheduledDate ?? row.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span> },
        { header: "Reason", accessor: "reason" },
        { header: "Status", accessor: (row) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status] ?? ""}`}>{row.status}</span> },
        {
            header: "",
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    {row.status === "confirmed" && row.videoRoomName && (
                        <a href={`/call/${row.videoRoomName}`} target="_blank" rel="noopener noreferrer" title="Join video call" className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                            <Video className="h-3.5 w-3.5" />
                        </a>
                    )}
                    {row.status === "rejected" && row.rejectionReason && (
                        <span className="text-xs text-zinc-400 italic">{row.rejectionReason}</span>
                    )}
                    {(row.status === "pending" || row.status === "confirmed") && (
                        <button
                            onClick={() => setCancelId(row.id)}
                            title="Cancel appointment"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ),
            className: "w-32",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`My Appointments ${total > 0 ? `(${total})` : ""}`} />
            <div className="flex items-center gap-1 border-b border-zinc-100">
                {filters.map(f => <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${statusFilter === f.value ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>{f.label}</button>)}
            </div>
            <DataTable data={appointments} columns={columns} loading={loading} emptyMessage="No appointments yet" />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            <ConfirmModal
                open={!!cancelId}
                onClose={() => setCancelId(null)}
                onConfirm={handleCancel}
                loading={cancelling}
                title="Cancel Appointment"
                description="Are you sure you want to cancel this appointment? The doctor will be notified."
                confirmLabel="Cancel appointment"
            />
        </div>
    )
}
