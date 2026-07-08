
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Users, Calendar, FlaskConical, Pill } from "lucide-react"

interface Stats {
    patients: number; appointments: number; labTests: number; prescriptions: number
}

export default function StaffDashboardPage() {
    const { slug }          = useParams<{ slug: string }>()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [name, setName]   = useState("")
    const [role, setRole]   = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        const n = cookies[`staff_${slug}_name`]
        const r = cookies[`staff_${slug}_role`]
        if (n) setName(decodeURIComponent(n).split(" ")[0])
        if (r) setRole(r)

        fetch(`/api/${slug}/admin/dashboard`)
            .then(r => r.json())
            .then(data => { setStats(data.stats); setLoading(false) })
    }, [slug])

    const allCards = [
        { label: "Patients",      value: stats?.patients,      icon: Users,        color: "text-primary",       roles: ["nurse", "receptionist"] },
        { label: "Appointments",  value: stats?.appointments,  icon: Calendar,     color: "text-amber-500",     roles: ["nurse", "receptionist"] },
        { label: "Lab Tests",     value: stats?.labTests,      icon: FlaskConical, color: "text-blue-500",      roles: ["nurse"] },
        { label: "Prescriptions", value: stats?.prescriptions, icon: Pill,         color: "text-purple-500",    roles: ["pharmacist"] },
    ]

    const cards = allCards.filter(c => c.roles.includes(role))

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900">Good morning{name ? `, ${name}` : ""}</h2>
                <p className="text-sm text-zinc-500 mt-1 capitalize">{role.replace("_", " ")} dashboard</p>
            </div>
            <div className={`grid gap-4 ${cards.length === 1 ? "grid-cols-1 max-w-xs" : cards.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
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
        </div>
    )
}
