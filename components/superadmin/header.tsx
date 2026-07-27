
"use client"

import { usePathname } from "next/navigation"

export function SuperAdminHeader() {
    const pathname = usePathname()
    const titles: Record<string, string> = {
        "/superadmin/dashboard": "Dashboard",
        "/superadmin/hospitals":      "Hospitals",
        "/superadmin/subscriptions":  "Subscriptions",
        "/superadmin/analytics":      "Analytics",
        "/superadmin/settings":       "Settings",
    }
    const title = titles[pathname] ?? "Super Admin"

    return (
        <header className="h-16 fixed top-0 left-0 md:left-60 right-0 z-10 bg-white border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8">
            <h1 className="text-sm font-medium text-zinc-900">{title}</h1>
            <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                <span className="text-xs font-medium text-white">SA</span>
            </div>
        </header>
    )
}
