
"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

export function HospitalAdminHeader() {
    const { slug }    = useParams<{ slug: string }>()
    const pathname    = usePathname()
    const [initials, setInitials] = useState("AD")
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
        const parts = pathname.split("/")
        const last  = parts[parts.length - 1]
        const titles: Record<string, string> = {
            dashboard: "Dashboard", patients: "Patients", doctors: "Doctors",
            staff: "Staff", appointments: "Appointments", "lab-tests": "Lab Tests",
            prescriptions: "Prescriptions", drugs: "Drug Catalogue", orders: "Orders",
            settings: "Settings",
        }
        return titles[last] ?? "Admin"
    }

    return (
        <header className="h-16 fixed top-0 left-0 md:left-60 right-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8">
            <h1 className="text-sm font-medium text-zinc-900 dark:text-white">{getTitle()}</h1>
            <div className="flex items-center gap-3">
                <button className="relative h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <Bell className="h-4 w-4 text-zinc-500" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-primary dark:bg-white flex items-center justify-center">
                        <span className="text-xs font-medium text-white dark:text-zinc-900">{initials}</span>
                    </div>
                    {role && <span className="text-xs text-zinc-400 capitalize hidden md:block">{role}</span>}
                </div>
            </div>
        </header>
    )
}
