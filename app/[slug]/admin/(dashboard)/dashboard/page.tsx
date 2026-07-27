
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Users, Calendar, Stethoscope, FlaskConical, TrendingUp, CheckCircle2 } from "lucide-react"

interface Stats {
    patients:     number
    doctors:      number
    appointments: number
    labTests:     number
}

interface MonthData {
    month:        string
    appointments: number
    patients:     number
    completed:    number
}

interface StatusData {
    status: string
    _count: { id: number }
}

interface TopDoctor {
    name:         string
    specialty:    string | null
    appointments: number
}

const statusColors: Record<string, string> = {
    pending:     "#f59e0b",
    confirmed:   "#10b981",
    completed:   "#8b5cf6",
    cancelled:   "#71717a",
    rejected:    "#ef4444",
    rescheduled: "#3b82f6",
}

export default function HospitalAdminDashboard() {
    const { slug }          = useParams<{ slug: string }>()
    const [stats, setStats] = useState<Stats | null>(null)
    const [byMonth, setByMonth]             = useState<MonthData[]>([])
    const [statusBreakdown, setStatusBreakdown] = useState<StatusData[]>([])
    const [topDoctors, setTopDoctors]       = useState<TopDoctor[]>([])
    const [loading, setLoading]             = useState(true)
    const [hospitalName, setHospitalName]   = useState("")

    useEffect(() => {
        Promise.all([
            fetch(`/api/${slug}/admin/dashboard`).then(r => r.json()),
            fetch(`/api/${slug}/admin/analytics`).then(r => r.json()),
        ]).then(([dashData, analyticsData]) => {
            setStats(dashData.stats)
            setHospitalName(dashData.hospital?.name ?? "")
            setByMonth(analyticsData.byMonth ?? [])
            setStatusBreakdown(analyticsData.statusBreakdown ?? [])
            setTopDoctors(analyticsData.topDoctors ?? [])
            setLoading(false)
        })
    }, [slug])

    const maxAppointments = Math.max(...byMonth.map(m => m.appointments), 1)
    const totalAppts      = statusBreakdown.reduce((s, d) => s + d._count.id, 0)

    const cards = [
        { label: "Patients",     value: stats?.patients,     icon: Users,        color: "text-primary" },
        { label: "Doctors",      value: stats?.doctors,      icon: Stethoscope,  color: "text-emerald-500" },
        { label: "Appointments", value: stats?.appointments, icon: Calendar,     color: "text-amber-500" },
        { label: "Lab tests",    value: stats?.labTests,     icon: FlaskConical, color: "text-blue-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900">{hospitalName || "Dashboard"}</h2>
                <p className="text-sm text-zinc-500 mt-1">Overview of your hospital</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            <div className="grid md:grid-cols-2 gap-6">
                {/* Appointments bar chart */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-zinc-900">Appointments — last 6 months</h3>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    {loading ? (
                        <div className="h-32 bg-zinc-50 rounded-xl animate-pulse" />
                    ) : byMonth.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-8">No data yet</p>
                    ) : (
                        <div className="flex items-end gap-2 h-32">
                            {byMonth.map(({ month, appointments }) => (
                                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-zinc-600">{appointments}</span>
                                    <div
                                        className="w-full bg-primary rounded-t-lg transition-all"
                                        style={{ height: `${(appointments / maxAppointments) * 100}%`, minHeight: appointments > 0 ? "4px" : "0" }}
                                    />
                                    <span className="text-xs text-zinc-400">{month.split(" ")[0]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Appointment status breakdown */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-zinc-900">Appointment status</h3>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    {loading ? (
                        <div className="space-y-3">{Array.from({length: 4}).map((_, i) => <div key={i} className="h-6 bg-zinc-50 rounded animate-pulse" />)}</div>
                    ) : statusBreakdown.length === 0 ? (
                        <p className="text-sm text-zinc-400">No appointments yet</p>
                    ) : (
                        <div className="space-y-3">
                            {statusBreakdown.map(({ status, _count }) => (
                                <div key={status} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="capitalize text-zinc-600">{status}</span>
                                        <span className="font-medium text-zinc-900">{_count.id}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width:           `${(_count.id / totalAppts) * 100}%`,
                                                backgroundColor: statusColors[status] ?? "#71717a",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top doctors */}
            <div className="bg-white rounded-2xl border border-zinc-100">
                <div className="px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-medium text-zinc-900">Top doctors by appointments</h3>
                </div>
                {loading ? (
                    <div className="px-6 py-8"><div className="h-24 bg-zinc-50 rounded animate-pulse" /></div>
                ) : topDoctors.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-400">No doctors yet</div>
                ) : (
                    <ul className="divide-y divide-zinc-50">
                        {topDoctors.map((doc, i) => (
                            <li key={doc.name} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-400 w-4">{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">{doc.name}</p>
                                        <p className="text-xs text-zinc-400">{doc.specialty}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-24 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${(doc.appointments / (topDoctors[0]?.appointments || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-700 w-6 text-right">{doc.appointments}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
