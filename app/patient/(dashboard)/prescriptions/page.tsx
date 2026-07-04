
"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import type { Prescription, PrescriptionStatus } from "@/types"

const statusStyles: Record<PrescriptionStatus, string> = {
    pending:   "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    paid:      "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    dispensed: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

export default function PatientPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading]             = useState(true)

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch("/api/patient/prescriptions")
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to fetch")
            setPrescriptions(data.prescriptions)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="My Prescriptions" />
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader title="My Prescriptions" />

            {prescriptions.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-12 text-center">
                    <p className="text-sm text-zinc-400">No prescriptions yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(rx => (
                        <div key={rx.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        Dr. {rx.doctor?.name}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {new Date(rx.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "long", year: "numeric",
                                        })}
                                        {rx.diagnosis && ` · ${rx.diagnosis}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[rx.status]}`}>
                                        {rx.status}
                                    </span>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        GH₵ {rx.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {rx.items.map(item => (
                                    <div key={item.id} className="px-6 py-3 flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {item.drugName} <span className="text-zinc-400 font-normal">{item.dosage}</span>
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                {item.frequency} · {item.duration}
                                                {item.notes && ` · ${item.notes}`}
                                            </p>
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 shrink-0 ml-4">
                                            GH₵ {item.price.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {rx.notes && (
                                <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{rx.notes}</p>
                                </div>
                            )}

                            {rx.status === "pending" && (
                                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={() => window.location.href = `/patient/payment/${rx.id}`}
                                        className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Pay GH₵ {rx.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
