
"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"

export default function HospitalSettingsPage() {
    const { slug }  = useParams<{ slug: string }>()
    const [hospital, setHospital] = useState<any>(null)
    const [loading, setLoading]   = useState(true)

    useEffect(() => {
        fetch(`/api/${slug}/admin/dashboard`)
            .then(r => r.json())
            .then(d => { setHospital(d.hospital); setLoading(false) })
    }, [slug])

    if (loading) return <div className="space-y-6"><PageHeader title="Settings" /></div>

    return (
        <div className="space-y-6">
            <PageHeader title="Settings" />
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Hospital information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Hospital name</p>
                        <p className="text-zinc-900 dark:text-white font-medium">{hospital?.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Plan</p>
                        <p className="text-zinc-900 dark:text-white font-medium capitalize">{hospital?.plan}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Subscription status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${
                            hospital?.subscriptionStatus === "active" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
                            hospital?.subscriptionStatus === "trial"  ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400" :
                            "bg-red-50 dark:bg-red-950 text-red-500"
                        }`}>
                            {hospital?.subscriptionStatus}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400 mb-1">Portal URL</p>
                        <p className="text-zinc-900 dark:text-white font-mono text-xs">{typeof window !== "undefined" ? window.location.origin : ""}/${slug}/admin</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
