"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const titles: Record<string, string> = {
    "/patient/dashboard":    "Dashboard",
    "/patient/appointments": "My Appointments",
    "/patient/lab-tests":     "My Lab Tests",
    "/patient/prescriptions": "My Prescriptions",
}

export function PatientHeader() {
    const pathname = usePathname()
    const title    = titles[pathname] ?? "Patient Portal"
    const [initials, setInitials] = useState("PT")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        if (cookies.patientName) {
            const parts = decodeURIComponent(cookies.patientName).split(" ")
            setInitials(parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2))
        }
    }, [])

    return (
        <header className="h-16.25 fixed top-0 left-60 right-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-8">
            <h1 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h1>
            <div className="h-9 w-9 rounded-xl bg-primary dark:bg-white flex items-center justify-center">
                <span className="text-xs font-medium text-white dark:text-zinc-900">{initials}</span>
            </div>
        </header>
    )
}
