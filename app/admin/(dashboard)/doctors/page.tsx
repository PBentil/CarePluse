"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

import { toast } from "sonner"
import type { Doctor } from "@/types"
import {Column, DataTable} from "@/components/admin/data-table";
import {RowActions} from "@/components/admin/row-actions";
import {PageHeader} from "@/components/admin/page-header";
import {Modal} from "@/components/admin/modal";
import {ConfirmModal} from "@/components/admin/confirm-modal";

const PAGE_SIZE = 10

export default function DoctorsPage() {
    const [doctors, setDoctors]         = useState<Doctor[]>([])
    const [total, setTotal]             = useState(0)
    const [page, setPage]               = useState(1)
    const [search, setSearch]           = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [loading, setLoading]         = useState(true)

    const [addOpen, setAddOpen]         = useState(false)
    const [editDoctor, setEditDoctor]   = useState<Doctor | null>(null)
    const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => { setPage(1) }, [debouncedSearch])

    const fetchDoctors = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            page: String(page), limit: String(PAGE_SIZE),
            ...(debouncedSearch && { search: debouncedSearch }),
        })
        const res = await fetch(`/api/admin/doctors?${params}`)
        const data = await res.json()
        setDoctors(data.doctors)
        setTotal(data.total)
        setLoading(false)
    }, [page, debouncedSearch])

    useEffect(() => { fetchDoctors() }, [fetchDoctors])

    const handleDelete = async () => {
        if (!deleteDoctor) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/admin/doctors/${deleteDoctor.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete doctor")
            toast.success("Doctor removed")
            setDeleteDoctor(null)
            fetchDoctors()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setDeleteLoading(false)
        }
    }

    const columns: Column<Doctor>[] = [
        {
            header: "Name",
            accessor: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
                        {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-white">{row.name}</span>
                </div>
            ),
        },
        {
            header: "Specialization",
            accessor: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          {row.specialty}
        </span>
            ),
        },
        { header: "Email", accessor: "email" },
        {
            header: "Joined",
            accessor: (row) => new Date(row.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
            }),
        },
        {
            header: "",
            accessor: (row) => (
                <RowActions
                    onEdit={() => setEditDoctor(row)}
                    onDelete={() => setDeleteDoctor(row)}
                />
            ),
            className: "w-20",
        },
    ]

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="space-y-6">

            <PageHeader
                title={`Doctors ${total > 0 ? `(${total})` : ""}`}
                actions={[{ label: "Add Doctor", icon: Plus, onClick: () => setAddOpen(true) }]}
            />

            <DataTable
                data={doctors}
                columns={columns}
                loading={loading}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name, specialization or email..."
                emptyMessage="No doctors found"
            />

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | "...")[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
                                acc.push(p)
                                return acc
                            }, [])
                            .map((p, i) => p === "..." ? (
                                <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-zinc-400">…</span>
                            ) : (
                                <button key={p} onClick={() => setPage(p as number)}
                                        className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === p ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                                    {p}
                                </button>
                            ))}
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Doctor" description="Add a new doctor to the roster." size="md">
                <DoctorForm onSuccess={() => { setAddOpen(false); fetchDoctors() }} />
            </Modal>

            <Modal open={!!editDoctor} onClose={() => setEditDoctor(null)} title="Edit Doctor" description="Update doctor information." size="md">
                {editDoctor && <DoctorForm doctor={editDoctor} onSuccess={() => { setEditDoctor(null); fetchDoctors() }} />}
            </Modal>

            <ConfirmModal
                open={!!deleteDoctor}
                onClose={() => setDeleteDoctor(null)}
                onConfirm={handleDelete}
                loading={deleteLoading}
                title="Remove Doctor"
                description={`Are you sure you want to remove ${deleteDoctor?.name} from the roster? This cannot be undone.`}
                confirmLabel="Remove Doctor"
            />

        </div>
    )
}