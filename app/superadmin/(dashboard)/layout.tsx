import { MobileNav } from "@/components/mobile-nav"

import { SuperAdminSidebar } from "@/components/superadmin/sidebar"
import { SuperAdminHeader } from "@/components/superadmin/header"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50">
            <MobileNav><SuperAdminSidebar /></MobileNav>
            <SuperAdminHeader />
            <main className="md:ml-60 pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
