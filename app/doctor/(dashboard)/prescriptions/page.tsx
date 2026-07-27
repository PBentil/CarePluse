
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { Pagination } from "@/components/admin/pagination"
import type { Prescription, PrescriptionStatus } from "@/types"

const PAGE_SIZE = 10

const statusStyles: Record<PrescriptionStatus, string> = {
    pending:   "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    paid:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    dispensed: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

export default function DoctorPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [total, setTotal]                 = useState(0)
    const [page, setPage]                   = useState(1)
    const [loading, setLoading]             = useState(true)

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
            const res    = await fetch(`/api/doctor/prescriptions?${params}`)
            const data   = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setPrescriptions(data.prescriptions)
            setTotal(data.total)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    const columns: Column<Prescription>[] = [
        {
            header: "Patient",
            accessor: (row) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.patient?.fullName}</p>
                    <p className="text-zinc-400 text-xs">{row.patient?.phone}</p>
                </div>
            ),
        },
        {
            header: "Drugs",
            accessor: (row) => (
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {row.items.map(i => i.drugName).join(", ")}
                </p>
            ),
        },
        {
            header: "Total",
            accessor: (row) => (
                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                    GH₵ {row.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
                </span>
            ),
        },
        {
            header: "Date",
            accessor: (row) => (
                <span className="text-xs text-zinc-500">
                    {new Date(row.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                    })}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[row.status]}`}>
                    {row.status}
                </span>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title={`Prescriptions ${total > 0 ? `(${total})` : ""}`} />
            <DataTable
                data={prescriptions}
                columns={columns}
                loading={loading}
                emptyMessage="No prescriptions issued yet"
            />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
    )
}
