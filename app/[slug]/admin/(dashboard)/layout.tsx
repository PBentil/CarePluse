import { MobileNav } from "@/components/mobile-nav"

import { HospitalAdminSidebar } from "@/components/hospital/admin-sidebar"
import { HospitalAdminHeader } from "@/components/hospital/admin-header"

export default function HospitalAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <MobileNav><HospitalAdminSidebar /></MobileNav>
            <HospitalAdminHeader />
            <main className="md:ml-60 pt-16 md:pt-16.25">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
