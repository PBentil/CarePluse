
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Building2, CreditCard, BarChart2, Settings, LogOut } from "lucide-react"

export function SuperAdminSidebar() {
    const pathname = usePathname()
    const router   = useRouter()

    const navItems = [
        { label: "Dashboard",  href: "/superadmin/dashboard",  icon: LayoutDashboard },
        { label: "Hospitals",      href: "/superadmin/hospitals",      icon: Building2 },
        { label: "Subscriptions",  href: "/superadmin/subscriptions",  icon: CreditCard },
        { label: "Analytics",      href: "/superadmin/analytics",      icon: BarChart2 },
        { label: "Settings",       href: "/superadmin/settings",       icon: Settings },
    ]

    const handleLogout = async () => {
        await fetch("/api/superadmin/logout", { method: "POST" })
        router.push("/superadmin/login")
        router.refresh()
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 bg-zinc-900 flex flex-col z-20">
            <div className="px-5 py-5 border-b border-zinc-800 shrink-0">
                <Logo />
            </div>
            <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-xs text-zinc-500">CarePulse Platform</p>
                <p className="text-xs font-medium text-zinc-300">Super Admin</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? "bg-white text-zinc-900 font-medium" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>
            <div className="px-3 py-4 border-t border-zinc-800 shrink-0">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-red-950 hover:text-red-400 transition-colors">
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
