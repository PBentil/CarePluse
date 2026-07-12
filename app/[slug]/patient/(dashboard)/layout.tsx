import { MobileNav } from "@/components/mobile-nav"

import { PatientSidebar } from "@/components/hospital/patient/sidebar"
import { PatientHeader } from "@/components/hospital/patient/header"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50">
            <MobileNav><PatientSidebar /></MobileNav>
            <PatientHeader />
            <main className="md:ml-60 pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
