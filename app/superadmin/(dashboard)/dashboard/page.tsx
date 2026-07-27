
"use client"

import { useEffect, useState } from "react"
import { Building2, Users, Stethoscope, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Stats {
    totalHospitals:    number
    activeHospitals:   number
    trialHospitals:    number
    expiredHospitals:  number
    totalDoctors:      number
    totalPatients:     number
    totalAppointments: number
    totalRevenue:      number
}

interface Hospital {
    id: string; name: string; slug: string; plan: string; subscriptionStatus: string; createdAt: string
}

const statusStyles: Record<string, string> = {
    active:  "bg-emerald-50 text-emerald-600",
    trial:   "bg-amber-50 text-amber-600",
    expired: "bg-red-50 text-red-500",
}

export default function SuperAdminDashboard() {
    const [stats, setStats]             = useState<Stats | null>(null)
    const [recentHospitals, setRecent]  = useState<Hospital[]>([])
    const [loading, setLoading]         = useState(true)

    useEffect(() => {
        fetch("/api/superadmin/dashboard")
            .then(r => r.json())
            .then(data => { setStats(data.stats); setRecent(data.recentHospitals); setLoading(false) })
    }, [])

    const cards = [
        { label: "Total hospitals",    value: stats?.totalHospitals,    icon: Building2,  color: "text-primary" },
        { label: "Active",             value: stats?.activeHospitals,   icon: TrendingUp, color: "text-emerald-500" },
        { label: "On trial",           value: stats?.trialHospitals,    icon: Building2,  color: "text-amber-500" },
        { label: "Total doctors",      value: stats?.totalDoctors,      icon: Stethoscope,color: "text-blue-500" },
        { label: "Total patients",     value: stats?.totalPatients,     icon: Users,      color: "text-purple-500" },
        { label: "Total appointments", value: stats?.totalAppointments, icon: Calendar,   color: "text-rose-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900">Platform Overview</h2>
                <p className="text-sm text-zinc-500 mt-1">All hospitals across CarePulse</p>
            </div>

            {/* Revenue card */}
            <div className="bg-zinc-900 rounded-2xl p-6 text-white">
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Monthly recurring revenue</p>
                <p className="text-4xl font-bold">GH₵ {loading ? "—" : (stats?.totalRevenue ?? 0).toLocaleString()}</p>
                <p className="text-xs text-zinc-400 mt-2">{stats?.activeHospitals ?? 0} active subscriptions</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-zinc-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-zinc-500">{label}</span>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className="text-2xl font-semibold text-zinc-900">{loading ? "—" : (value ?? 0)}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100">
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-900">Recently registered hospitals</h3>
                    <Link href="/superadmin/hospitals" className="text-xs text-primary hover:underline">View all</Link>
                </div>
                {loading ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-400">Loading...</div>
                ) : !recentHospitals.length ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-400">No hospitals yet</div>
                ) : (
                    <ul className="divide-y divide-zinc-50">
                        {recentHospitals.map(h => (
                            <li key={h.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900">{h.name}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">carepulse.com/{h.slug} · {h.plan}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[h.subscriptionStatus] ?? ""}`}>
                                        {h.subscriptionStatus}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {new Date(h.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
