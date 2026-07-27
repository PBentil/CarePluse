"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import type { Appointment, AppointmentStatus } from "@/types"
import { Column, DataTable } from "@/components/admin/data-table"
import { AppointmentActions } from "@/components/admin/appointment-application"
import { PageHeader } from "@/components/admin/page-header"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import {Pagination} from "@/components/admin/pagination";

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

export default function AppointmentsPage() {
    const [appointments, setAppointments]       = useState<Appointment[]>([])
    const [total, setTotal]                     = useState(0)
    const [page, setPage]                       = useState(1)
    const [search, setSearch]                   = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter]       = useState("")
    const [loading, setLoading]                 = useState(true)
    const [deleteId, setDeleteId]               = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading]     = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter])

    const fetchAppointments = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: String(page),
            limit: String(PAGE_SIZE),
            ...(debouncedSearch && { search: debouncedSearch }),
            ...(statusFilter    && { status: statusFilter }),
        })
        const res  = await fetch(`/api/admin/appointments?${params}`)
        const data = await res.json()
        setAppointments(data.appointments)
        setTotal(data.total)
        setLoading(false)
    }, [page, debouncedSearch, statusFilter])

    useEffect(() => { fetchAppointments() }, [fetchAppointments])

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/appointments/${deleteId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Appointment deleted")
            setDeleteId(null)
            fetchAppointments()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeleteLoading(false)
        }
    }

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
          {new Date(row.rescheduledDate ?? row.date).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
          })}
        </span>
            ),
        },
        { header: "Reason", accessor: "reason" },
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
                <AppointmentActions
                    appointment={row}
                    onSuccess={fetchAppointments}
                />
            ),
            className: "w-28",
        },
    ]

    return (
        <div className="space-y-6">

            <PageHeader title={`Appointments ${total > 0 ? `(${total})` : ""}`} />

            {/* Status filter tabs */}
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
                searchPlaceholder="Search by patient, doctor or reason..."
                emptyMessage="No appointments found"
            />

            <Pagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            <ConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                title="Delete Appointment"
                description="Are you sure you want to delete this appointment? This cannot be undone."
                confirmLabel="Delete"
            />

        </div>
    )
}