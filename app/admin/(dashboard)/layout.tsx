import {Sidebar} from "@/components/admin/sidebar";
import {Header} from "@/components/admin/header";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Sidebar />
            <Header />
            <main className="ml-60 pt-16.25">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}