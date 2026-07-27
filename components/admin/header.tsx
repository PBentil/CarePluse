"use client"

import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

const titles: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/patients": "Patients",
    "/admin/appointments": "Appointments",
    "/admin/lab-tests":     "Lab Tests",
    "/admin/prescriptions": "Prescriptions",
    "/admin/drugs":          "Drug Catalogue",
    "/admin/orders":         "Orders",
}

export function Header() {
    const pathname = usePathname()
    const title = titles[pathname] ?? "Admin"

    return (
        <header className="h-16.25 fixed top-0 left-60 right-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-8">

            <h1 className="text-sm font-medium text-zinc-900 dark:text-white">
                {title}
            </h1>

            <div className="flex items-center gap-3">
                <button className="relative h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <Bell className="h-4 w-4 text-zinc-500" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                </button>

                <div className="h-9 w-9 rounded-xl bg-primary dark:bg-white flex items-center justify-center">
                    <span className="text-xs font-medium text-white dark:text-zinc-900">AD</span>
                </div>
            </div>

        </header>
    )
}