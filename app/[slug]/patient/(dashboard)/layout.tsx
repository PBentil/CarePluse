
import { PatientSidebar } from "@/components/hospital/patient/sidebar"
import { PatientHeader } from "@/components/hospital/patient/header"

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50">
            <PatientSidebar />
            <PatientHeader />
            <main className="ml-60 pt-16">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
