"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Calendar, FlaskConical, Pill, Package, LogOut } from "lucide-react"

const navItems = [
    { label: "Dashboard",    href: "/patient/dashboard",    icon: LayoutDashboard },
    { label: "Appointments", href: "/patient/appointments", icon: Calendar },
    { label: "Lab Tests",      href: "/patient/lab-tests",      icon: FlaskConical },
    { label: "Prescriptions",  href: "/patient/prescriptions",  icon: Pill },
    { label: "My Orders",      href: "/patient/orders",          icon: Package },
]

export function PatientSidebar() {
    const pathname = usePathname()
    const router   = useRouter()

    const handleLogout = async () => {
        await fetch("/api/patient/logout", { method: "POST" })
        router.push("/patient/login")
        router.refresh()
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 flex flex-col z-20">
            <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
                <Logo />
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                active
                                    ? "bg-primary dark:bg-white text-white dark:text-zinc-900 font-medium"
                                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>
            <div className="px-3 py-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
