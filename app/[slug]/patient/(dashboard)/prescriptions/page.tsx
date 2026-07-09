
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"

interface PrescriptionItem { id: string; drugName: string; dosage: string; frequency: string; duration: string; price: number; notes?: string }
interface Prescription {
    id: string; status: string; diagnosis?: string; notes?: string; createdAt: string
    doctor?: { name: string }
    items: PrescriptionItem[]
}

const statusStyles: Record<string, string> = {
    pending:   "bg-amber-50 text-amber-600",
    paid:      "bg-emerald-50 text-emerald-600",
    dispensed: "bg-blue-50 text-blue-600",
}

export default function PatientPrescriptionsPage() {
    const { slug }  = useParams<{ slug: string }>()
    const router    = useRouter()
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading]             = useState(true)

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/patient/prescriptions`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setPrescriptions(data.prescriptions)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug])

    useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

    if (loading) return <div className="space-y-6"><PageHeader title="My Prescriptions" /></div>

    return (
        <div className="space-y-6">
            <PageHeader title="My Prescriptions" />
            {prescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
                    <p className="text-sm text-zinc-400">No prescriptions yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map(rx => (
                        <div key={rx.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">Dr. {rx.doctor?.name}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                                        {rx.diagnosis && ` · ${rx.diagnosis}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[rx.status] ?? ""}`}>{rx.status}</span>
                                    <p className="text-sm font-semibold text-zinc-900">GH₵ {rx.items.reduce((s, i) => s + i.price, 0).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="divide-y divide-zinc-50">
                                {rx.items.map(item => (
                                    <div key={item.id} className="px-6 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-zinc-900">{item.drugName} <span className="text-zinc-400">{item.dosage}</span></p>
                                            <p className="text-xs text-zinc-400">{item.frequency} · {item.duration}{item.notes && ` · ${item.notes}`}</p>
                                        </div>
                                        <p className="text-sm text-zinc-600">GH₵ {item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            {rx.status === "pending" && (
                                <div className="px-6 py-4 border-t border-zinc-100">
                                    <button onClick={() => router.push(`/${slug}/patient/payment/${rx.id}`)} className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                                        Pay GH₵ {rx.items.reduce((s, i) => s + i.price, 0).toFixed(2)}
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
