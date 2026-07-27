"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import type { Appointment, AppointmentStatus } from "@/types"
import { Column, DataTable } from "@/components/admin/data-table"
import { DoctorAppointmentActions } from "@/components/doctor/appointment-actions"
import { DoctorPatientDetails } from "@/components/doctor/patient-details"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"

const PAGE_SIZE = 10

const statusStyles: Record<AppointmentStatus, string> = {
    pending:     "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    confirmed:   "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    rejected:    "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
    rescheduled: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

const filters: { label: string; value: string }[] = [
    { label: "All",         value: "" },
    { label: "Pending",     value: "pending" },
    { label: "Confirmed",   value: "confirmed" },
    { label: "Rescheduled", value: "rescheduled" },
    { label: "Rejected",    value: "rejected" },
]

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments]       = useState<Appointment[]>([])
    const [total, setTotal]                     = useState(0)
    const [page, setPage]                       = useState(1)
    const [search, setSearch]                   = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter]       = useState("")
    const [loading, setLoading]                 = useState(true)
    const [viewPatientId, setViewPatientId]     = useState<string | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter    && { status: statusFilter }),
            })
            const res  = await fetch(`/api/doctor/appointments?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setAppointments(data.appointments)
            setTotal(data.total)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, statusFilter])

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
            header: "Date",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {new Date(row.rescheduledDate ?? row.date).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                    })}
                </span>
            ),
        },
        {
            header: "Reason",
            accessor: "reason",
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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewPatientId(row.patientId)}
                        title="View patient"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                    <DoctorAppointmentActions
                        appointment={row}
                        onSuccess={fetchAppointments}
                    />
                </div>
            ),
            className: "w-28",
        },
    ]

    return (
        <div className="space-y-6">

            <PageHeader title={`Appointments ${total > 0 ? `(${total})` : ""}`} />

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
                data={appointments}
                columns={columns}
                loading={loading}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by patient or reason..."
                emptyMessage="No appointments found"
            />

            <Pagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            <DoctorPatientDetails
                patientId={viewPatientId}
                onClose={() => setViewPatientId(null)}
                onAppointmentChange={fetchAppointments}
            />

        </div>
    )
}