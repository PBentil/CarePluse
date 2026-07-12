import { MobileNav } from "@/components/mobile-nav"

import { StaffSidebar } from "@/components/hospital/staff/sidebar"
import { StaffHeader } from "@/components/hospital/staff/header"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50">
            <MobileNav><StaffSidebar /></MobileNav>
            <StaffHeader />
            <main className="md:ml-60 pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
