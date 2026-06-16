"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Eye } from "lucide-react"
import { toast } from "sonner"
import type { Patient } from "@/types"
import { Column, DataTable } from "@/components/admin/data-table"
import { RowActions } from "@/components/admin/row-actions"
import { PageHeader } from "@/components/admin/page-header"
import { Modal } from "@/components/admin/modal"
import { AddPatientForm } from "@/components/forms/add-patient"
import { EditPatientForm } from "@/components/forms/edit-patient"
import { ConfirmModal } from "@/components/admin/confirm-modal"
import { PatientDetails } from "@/components/admin/patient-details"
import { Pagination } from "@/components/admin/pagination"

const PAGE_SIZE = 10

export default function PatientsPage() {
    const [patients, setPatients]           = useState<Patient[]>([])
    const [total, setTotal]                 = useState(0)
    const [page, setPage]                   = useState(1)
    const [search, setSearch]               = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]             = useState(true)
    const [addOpen, setAddOpen]             = useState(false)
    const [editPatient, setEditPatient]     = useState<Patient | null>(null)
    const [deletePatient, setDeletePatient] = useState<Patient | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [viewPatientId, setViewPatientId] = useState<string | null>(null)

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
            const res  = await fetch(`/api/admin/patients?${params}`)
            const data = await res.json()
            setPatients(data.patients)
            setTotal(data.total)
        } catch {
            toast.error("Failed to load patients")
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch])

    useEffect(() => { fetchPatients() }, [fetchPatients])

    const handleDelete = async () => {
        if (!deletePatient) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/patients/${deletePatient.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete patient")
            toast.success("Patient deleted")
            setDeletePatient(null)
            fetchPatients()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setDeleteLoading(false)
        }
    }

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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewPatientId(row.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </button>
                    <RowActions
                        onEdit={() => setEditPatient(row)}
                        onDelete={() => setDeletePatient(row)}
                    />
                </div>
            ),
            className: "w-24",
        },
    ]

    return (
        <div className="space-y-6">

            <PageHeader
                title={`Patients ${total > 0 ? `(${total})` : ""}`}
                actions={[{ label: "Add Patient", icon: Plus, onClick: () => setAddOpen(true) }]}
            />

            <DataTable
                data={patients}
                columns={columns}
                loading={loading}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name or email..."
                emptyMessage="No patients found"
            />

            <Pagination
                page={page}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Patient" description="Fill in the patient's details below." size="xl">
                <AddPatientForm onSuccess={() => { setAddOpen(false); fetchPatients() }} />
            </Modal>

            <Modal open={!!editPatient} onClose={() => setEditPatient(null)} title="Edit Patient" description="Update the patient's information." size="xl">
                {editPatient && (
                    <EditPatientForm
                        patient={editPatient}
                        onSuccess={() => { setEditPatient(null); fetchPatients() }}
                    />
                )}
            </Modal>

            <PatientDetails
                patientId={viewPatientId}
                onClose={() => setViewPatientId(null)}
                onEdit={(patient) => { setViewPatientId(null); setEditPatient(patient) }}
                onDelete={(patient) => { setViewPatientId(null); setDeletePatient(patient) }}
            />

            <ConfirmModal
                open={!!deletePatient}
                onClose={() => setDeletePatient(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                title="Delete Patient"
                description={`Are you sure you want to delete ${deletePatient?.fullName}? This action cannot be undone.`}
                confirmLabel="Delete Patient"
            />

        </div>
    )
}