
"use client"

import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Calendar, Users, FlaskConical, Pill, Clock, Settings, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

export function DoctorSidebar() {
    const { slug }  = useParams<{ slug: string }>()
    const pathname  = usePathname()
    const router    = useRouter()
    const [name, setName] = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)
        const n = cookies[`doctor_${slug}_name`]
        if (n) setName(decodeURIComponent(n))
    }, [slug])

    const navItems = [
        { label: "Dashboard",     href: `/${slug}/doctor/dashboard`,     icon: LayoutDashboard },
        { label: "Patients",      href: `/${slug}/doctor/patients`,      icon: Users },
        { label: "Appointments",  href: `/${slug}/doctor/appointments`,  icon: Calendar },
        { label: "Lab Tests",     href: `/${slug}/doctor/lab-tests`,     icon: FlaskConical },
        { label: "Prescriptions", href: `/${slug}/doctor/prescriptions`, icon: Pill },
        { label: "Availability",  href: `/${slug}/doctor/availability`,  icon: Clock },
        { label: "Settings",      href: `/${slug}/doctor/settings`,      icon: Settings },
    ]

    const handleLogout = async () => {
        await fetch(`/api/${slug}/doctor/logout`, { method: "POST" })
        router.push(`/${slug}/doctor/login`)
        router.refresh()
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-zinc-100 flex flex-col z-20">
            <div className="px-5 py-5 border-b border-zinc-100 shrink-0">
                <Logo />
            </div>
            {name && (
                <div className="px-4 py-3 border-b border-zinc-50">
                    <p className="text-xs text-zinc-400">Signed in as</p>
                    <p className="text-xs font-medium text-zinc-700 truncate">Dr. {name}</p>
                </div>
            )}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? "bg-primary text-white font-medium" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}>
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    )
                })}
            </nav>
            <div className="px-3 py-4 border-t border-zinc-100 shrink-0">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
