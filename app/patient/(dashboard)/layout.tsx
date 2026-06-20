import { PatientSidebar } from "@/components/patient/sidebar"
import { PatientHeader } from "@/components/patient/header"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <PatientSidebar />
            <PatientHeader />
            <main className="ml-60 pt-16.25">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
