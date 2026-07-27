"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import type { Patient } from "@/types"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import { DoctorPatientDetails } from "@/components/doctor/patient-details"

const PAGE_SIZE = 10

export default function DoctorPatientsPage() {
    const [patients, setPatients]               = useState<Patient[]>([])
    const [total, setTotal]                     = useState(0)
    const [page, setPage]                       = useState(1)
    const [search, setSearch]                   = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]                 = useState(true)
    const [viewPatientId, setViewPatientId]     = useState<string | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page:  String(page),
                limit: String(PAGE_SIZE),
                ...(debouncedSearch && { search: debouncedSearch }),
            })
            const res  = await fetch(`/api/doctor/patients?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setPatients(data.patients)
            setTotal(data.total)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch])

    useEffect(() => { fetchPatients() }, [fetchPatients])

    const columns: Column<Patient>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
                        {row.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-white">{row.fullName}</span>
                </div>
            ),
        },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        {
            header: "Gender",
            accessor: (row) => row.gender ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {row.gender}
                </span>
            ) : (
                <span className="text-zinc-300 dark:text-zinc-600">—</span>
            ),
        },
        {
            header: "Registered",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
            }),
        },
        {
            header: "",
            accessor: (row) => (
                <button
                    onClick={() => setViewPatientId(row.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                </button>
            ),
            className: "w-12",
        },
    ]

    return (
        <div className="space-y-6">

            <PageHeader title={`My Patients ${total > 0 ? `(${total})` : ""}`} />

            <DataTable
                data={patients}
                columns={columns}
                loading={loading}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name, email or phone..."
                emptyMessage="No patients assigned to you yet"
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
                onAppointmentChange={fetchPatients}
            />

        </div>
    )
}