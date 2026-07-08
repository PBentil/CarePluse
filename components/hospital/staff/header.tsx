
"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function StaffHeader() {
    const { slug }  = useParams<{ slug: string }>()
    const pathname  = usePathname()
    const [initials, setInitials] = useState("ST")
    const [role, setRole]         = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        const name = cookies[`staff_${slug}_name`]
        const r    = cookies[`staff_${slug}_role`]
        if (name) {
            const parts = decodeURIComponent(name).split(" ")
            setInitials(parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2))
        }
        if (r) setRole(r.replace("_", " "))
    }, [slug])

    const getTitle = () => {
        const last = pathname.split("/").pop()
        const titles: Record<string, string> = {
            dashboard: "Dashboard", patients: "Patients", appointments: "Appointments",
            "lab-tests": "Lab Tests", prescriptions: "Prescriptions", drugs: "Drug Catalogue", orders: "Orders",
        }
        return titles[last ?? ""] ?? "Staff Portal"
    }

    return (
        <header className="h-16 fixed top-0 left-60 right-0 z-10 bg-white border-b border-zinc-100 flex items-center justify-between px-8">
            <h1 className="text-sm font-medium text-zinc-900">{getTitle()}</h1>
            <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{initials}</span>
                </div>
                {role && <span className="text-xs text-zinc-400 capitalize">{role}</span>}
            </div>
        </header>
    )
}
