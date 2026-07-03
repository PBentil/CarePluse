
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { ExternalLink } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import { PageHeader } from "@/components/admin/page-header"
import { UploadLabResult } from "@/components/patient/upload-lab-result"
import type { LabTest, LabTestStatus } from "@/types"

const statusStyles: Record<LabTestStatus, string> = {
    ordered:    "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    processing: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    completed:  "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
}

export default function PatientLabTestsPage() {
    const [labTests, setLabTests] = useState<LabTest[]>([])
    const [loading, setLoading]   = useState(true)

    const fetchLabTests = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch("/api/patient/lab-tests")
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setLabTests(data.labTests)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchLabTests() }, [fetchLabTests])

    const columns: Column<LabTest>[] = [
        {
            header: "Test",
            accessor: (row) => (
                <p className="font-medium text-zinc-900 dark:text-white text-xs">{row.testName}</p>
            ),
        },
        {
            header: "Doctor",
            accessor: (row) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-300">{row.doctor?.name ?? "Self-uploaded"}</span>
            ),
        },
        {
            header: "Date",
            accessor: (row) => (
                <span className="text-xs text-zinc-500">
                    {new Date(row.orderedAt).toLocaleDateString("en-GB", {
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
        {
            header: "Results",
            accessor: (row) => {
                if (row.status === "completed") {
                    return (
                        <div className="space-y-1">
                            {row.resultNotes && (
                                <p className="text-xs text-zinc-600 dark:text-zinc-300">{row.resultNotes}</p>
                            )}
                            {row.resultUrl && (
                                <a
                                    href={row.resultUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    View file <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    )
                }
                if (row.status === "ordered") {
                    return <UploadLabResult labTest={row} onSuccess={fetchLabTests} />
                }
                return <span className="text-xs text-zinc-400">Processing</span>
            },
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title="My Lab Tests" />
                <UploadLabResult onSuccess={fetchLabTests} />
            </div>

            <DataTable
                data={labTests}
                columns={columns}
                loading={loading}
                emptyMessage="No lab tests yet — upload your results or wait for your doctor to order tests"
            />
        </div>
    )
}
