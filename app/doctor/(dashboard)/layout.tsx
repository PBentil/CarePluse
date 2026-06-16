import { DoctorSidebar } from "@/components/doctor/sidebar"
import { DoctorHeader } from "@/components/doctor/header"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <DoctorSidebar />
            <DoctorHeader />
            <main className="ml-60 pt-16.25">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}