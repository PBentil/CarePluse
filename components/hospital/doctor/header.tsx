
"use client"

import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { PushBell } from "@/components/push-bell"

export function DoctorHeader() {
    const { slug }  = useParams<{ slug: string }>()
    const pathname  = usePathname()
    const [initials, setInitials] = useState("DR")
    const [doctorId, setDoctorId] = useState("")

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)
        const name = cookies[`doctor_${slug}_name`]
        const id   = cookies[`doctor_${slug}_id`]
        if (name) {
            const parts = decodeURIComponent(name).split(" ")
            setInitials(parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2))
        }
        if (id) setDoctorId(id)
    }, [slug])

    const getTitle = () => {
        const last = pathname.split("/").pop()
        const titles: Record<string, string> = {
            dashboard:    "Dashboard",
            patients:     "My Patients",
            appointments: "Appointments",
            "lab-tests":  "Lab Tests",
            prescriptions:"Prescriptions",
            availability: "My Availability",
            settings:     "Settings",
        }
        return titles[last ?? ""] ?? "Doctor Portal"
    }

    return (
        <header className="h-16 fixed top-0 left-0 md:left-60 right-0 z-10 bg-white border-b border-zinc-100 flex items-center justify-between px-4 md:px-8 pl-16 md:pl-8">
            <h1 className="text-sm font-medium text-zinc-900">{getTitle()}</h1>
            <div className="flex items-center gap-2">
                {doctorId && <PushBell slug={slug} userId={doctorId} userType="doctor" />}
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{initials}</span>
                </div>
            </div>
        </header>
    )
}
