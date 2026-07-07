
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Users, Calendar, Stethoscope, FlaskConical } from "lucide-react"

interface Stats {
    patients:     number
    doctors:      number
    appointments: number
    labTests:     number
}

export default function HospitalAdminDashboard() {
    const { slug }          = useParams<{ slug: string }>()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [hospitalName, setHospitalName] = useState("")

    useEffect(() => {
        fetch(`/api/${slug}/admin/dashboard`)
            .then(r => r.json())
            .then(data => {
                setStats(data.stats)
                setHospitalName(data.hospital?.name ?? "")
                setLoading(false)
            })
    }, [slug])

    const cards = [
        { label: "Patients",     value: stats?.patients,     icon: Users,        color: "text-primary" },
        { label: "Doctors",      value: stats?.doctors,      icon: Stethoscope,  color: "text-emerald-500" },
        { label: "Appointments", value: stats?.appointments, icon: Calendar,     color: "text-amber-500" },
        { label: "Lab tests",    value: stats?.labTests,     icon: FlaskConical, color: "text-blue-500" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{hospitalName || "Dashboard"}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of your hospital</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
                            <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                            {loading ? "—" : (value ?? 0)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
