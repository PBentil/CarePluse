"use client"

import { MobileNav } from "@/components/mobile-nav"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { DoctorSidebar } from "@/components/hospital/doctor/sidebar"
import { DoctorHeader } from "@/components/hospital/doctor/header"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    useAuthGuard("doctor")
    return (
        <div className="min-h-screen bg-zinc-50">
            <MobileNav><DoctorSidebar /></MobileNav>
            <DoctorHeader />
            <main className="md:ml-60 pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
