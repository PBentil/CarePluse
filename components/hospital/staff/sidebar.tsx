
"use client"

import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { LayoutDashboard, Users, Calendar, FlaskConical, Pill, Tablets, Package, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

const roleNav: Record<string, { label: string; href: (slug: string) => string; icon: React.ElementType }[]> = {
    nurse: [
        { label: "Dashboard",    href: (s) => `/${s}/staff/dashboard`,    icon: LayoutDashboard },
        { label: "Patients",     href: (s) => `/${s}/staff/patients`,     icon: Users },
        { label: "Appointments", href: (s) => `/${s}/staff/appointments`, icon: Calendar },
        { label: "Lab Tests",    href: (s) => `/${s}/staff/lab-tests`,    icon: FlaskConical },
    ],
    receptionist: [
        { label: "Dashboard",    href: (s) => `/${s}/staff/dashboard`,    icon: LayoutDashboard },
        { label: "Patients",     href: (s) => `/${s}/staff/patients`,     icon: Users },
        { label: "Appointments", href: (s) => `/${s}/staff/appointments`, icon: Calendar },
    ],
    pharmacist: [
        { label: "Dashboard",      href: (s) => `/${s}/staff/dashboard`,      icon: LayoutDashboard },
        { label: "Prescriptions",  href: (s) => `/${s}/staff/prescriptions`,  icon: Pill },
        { label: "Drug Catalogue", href: (s) => `/${s}/staff/drugs`,          icon: Tablets },
        { label: "Orders",         href: (s) => `/${s}/staff/orders`,         icon: Package },
    ],
}

export function StaffSidebar() {
    const { slug }  = useParams<{ slug: string }>()
    const pathname  = usePathname()
    const router    = useRouter()
    const [role, setRole] = useState("")
    const [name, setName] = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)
        setRole(cookies[`staff_${slug}_role`] ?? "")
        setName(decodeURIComponent(cookies[`staff_${slug}_name`] ?? ""))
    }, [slug])

    const navItems = roleNav[role] ?? []

    const handleLogout = async () => {
        await fetch("/api/auth/staff/logout", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ slug }),
        })
        router.push(`/${slug}/admin/login`)
        router.refresh()
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-zinc-100 flex flex-col z-20">
            <div className="px-5 py-5 border-b border-zinc-100 shrink-0">
                <Logo />
            </div>
            <div className="px-4 py-3 border-b border-zinc-50">
                <p className="text-xs text-zinc-400">Signed in as</p>
                <p className="text-xs font-medium text-zinc-700 truncate">{name}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-xs font-medium capitalize mt-1">
                    {role.replace("_", " ")}
                </span>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href(slug)
                    return (
                        <Link key={label} href={href(slug)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            active
                                ? "bg-primary text-white font-medium"
                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}>
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
