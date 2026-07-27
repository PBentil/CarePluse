
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/page-header"
import { TrendingUp } from "lucide-react"

interface MonthData { month: string; hospitals: number }
interface PlanRevenue { plan: string; _sum: { amount: number | null }; _count: { id: number } }
interface TopHospital { name: string; slug: string; appointments: number; patients: number }

const planColors: Record<string, string> = {
    starter:    "bg-blue-500",
    growth:     "bg-purple-500",
    enterprise: "bg-amber-500",
}

export default function SuperAdminAnalyticsPage() {
    const [byMonth, setByMonth]           = useState<MonthData[]>([])
    const [planRevenue, setPlanRevenue]   = useState<PlanRevenue[]>([])
    const [topHospitals, setTopHospitals] = useState<TopHospital[]>([])
    const [loading, setLoading]           = useState(true)

    useEffect(() => {
        fetch("/api/superadmin/analytics")
            .then(r => r.json())
            .then(data => {
                setByMonth(data.byMonth ?? [])
                setPlanRevenue(data.planRevenue ?? [])
                setTopHospitals(data.topHospitals ?? [])
                setLoading(false)
            })
            .catch(() => { toast.error("Failed to load analytics"); setLoading(false) })
    }, [])

    const maxHospitals = Math.max(...byMonth.map(m => m.hospitals), 1)

    return (
        <div className="space-y-8">
            <PageHeader title="Analytics" />

            {/* New hospitals per month */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                <h3 className="text-sm font-medium text-zinc-900 mb-6">New hospitals — last 6 months</h3>
                {loading ? (
                    <div className="h-40 bg-zinc-50 rounded-xl animate-pulse" />
                ) : byMonth.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">No data yet</p>
                ) : (
                    <div className="flex items-end gap-3 h-40">
                        {byMonth.map(({ month, hospitals }) => (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs font-medium text-zinc-700">{hospitals}</span>
                                <div
                                    className="w-full bg-primary rounded-t-lg transition-all"
                                    style={{ height: `${(hospitals / maxHospitals) * 100}%`, minHeight: hospitals > 0 ? "4px" : "0" }}
                                />
                                <span className="text-xs text-zinc-400 text-center">{month}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Revenue by plan */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <h3 className="text-sm font-medium text-zinc-900 mb-4">Revenue by plan</h3>
                    {loading ? (
                        <div className="space-y-3">{Array.from({length: 3}).map((_, i) => <div key={i} className="h-8 bg-zinc-50 rounded animate-pulse" />)}</div>
                    ) : planRevenue.length === 0 ? (
                        <p className="text-sm text-zinc-400">No active subscriptions</p>
                    ) : (
                        <div className="space-y-3">
                            {planRevenue.map(p => (
                                <div key={p.plan} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${planColors[p.plan] ?? "bg-zinc-400"}`} />
                                        <span className="text-sm capitalize text-zinc-700">{p.plan}</span>
                                        <span className="text-xs text-zinc-400">({p._count.id} hospitals)</span>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-900">
                                        GH₵ {(p._sum.amount ?? 0).toLocaleString()}/mo
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top hospitals */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <h3 className="text-sm font-medium text-zinc-900 mb-4">Most active hospitals</h3>
                    {loading ? (
                        <div className="space-y-3">{Array.from({length: 5}).map((_, i) => <div key={i} className="h-8 bg-zinc-50 rounded animate-pulse" />)}</div>
                    ) : topHospitals.length === 0 ? (
                        <p className="text-sm text-zinc-400">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topHospitals.map((h, i) => (
                                <div key={h.slug} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                                        <div>
                                            <p className="text-sm text-zinc-900">{h.name}</p>
                                            <p className="text-xs text-zinc-400">{h.patients} patients</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <TrendingUp className="h-3 w-3" />
                                        {h.appointments} appts
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
