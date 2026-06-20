"use client"

import { useEffect, useState } from "react"
import { Clock, CheckCircle2, ClipboardList, Video } from "lucide-react"
import Link from "next/link"

interface Appointment {
    id:            string
    date:          string
    reason:        string
    status:        string
    videoRoomName?: string
    doctor: { name: string; specialty: string }
}

interface DashboardStats {
    total:     number
    pending:   number
    confirmed: number
    upcoming:  Appointment[]
}

const statusStyles: Record<string, string> = {
    pending:     "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    confirmed:   "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    rejected:    "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
    rescheduled: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

export default function PatientDashboardPage() {
    const [stats, setStats]     = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [name, setName]       = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        if (cookies.patientName) {
            setName(decodeURIComponent(cookies.patientName).split(" ")[0])
        }

        fetch("/api/patient/dashboard")
            .then(r => r.json())
            .then(data => { setStats(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const cards = [
        { label: "Total appointments", value: stats?.total     ?? 0, icon: ClipboardList, color: "text-primary" },
        { label: "Pending",            value: stats?.pending   ?? 0, icon: Clock,         color: "text-amber-500" },
        { label: "Confirmed",          value: stats?.confirmed ?? 0, icon: CheckCircle2,  color: "text-emerald-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Good morning{name ? `, ${name}` : ""}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Here is an overview of your health journey.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                            {loading ? "—" : value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Upcoming appointments</h3>
                    <Link href="/patient/appointments" className="text-xs text-primary hover:underline">
                        View all
                    </Link>
                </div>

                {loading ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-400">Loading...</div>
                ) : !stats?.upcoming.length ? (
                    <div className="px-6 py-8 text-center text-sm text-zinc-400">No upcoming appointments</div>
                ) : (
                    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {stats.upcoming.map((appt) => (
                            <li key={appt.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{appt.doctor.name}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{appt.doctor.specialty} · {appt.reason}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {new Date(appt.date).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[appt.status]}`}>
                                        {appt.status}
                                    </span>
                                    {appt.status === "confirmed" && appt.videoRoomName && (
                                        <a
                                            href={`/call/${appt.videoRoomName}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                                            title="Join video call"
                                        >
                                            <Video className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
