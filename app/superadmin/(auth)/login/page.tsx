
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "@/components/ui/sonner"
import { Logo } from "@/components/logo"
import { ShieldCheck, Loader2 } from "lucide-react"

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"

export default function SuperAdminLoginPage() {
    const router = useRouter()
    const [email, setEmail]       = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading]   = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res  = await fetch("/api/superadmin/login", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Welcome back")
            router.push("/superadmin/dashboard")
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Login failed")
        } finally { setLoading(false) }
    }

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <header className="px-8 py-5 border-b border-zinc-100 bg-white">
                    <Logo />
                </header>
                <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-zinc-900">CarePulse Admin</h1>
                                <p className="text-sm text-zinc-500 mt-1">Platform administration</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@carepulse.app" className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} required />
                                </div>
                                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>
                        </div>
                        <p className="text-center text-xs text-zinc-400">Restricted to CarePulse team only.</p>
                    </div>
                </div>
            </div>
        </>
    )
}
