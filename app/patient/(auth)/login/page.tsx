"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "@/components/ui/sonner"
import { SubmitButton } from "@/components/submitButton"
import { Logo } from "@/components/logo"
import { UserCircle } from "lucide-react"

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export default function PatientLoginPage() {
    const router = useRouter()
    const [step, setStep]           = useState<"email" | "otp">("email")
    const [email, setEmail]         = useState("")
    const [code, setCode]           = useState("")
    const [patientId, setPatientId] = useState("")
    const [loading, setLoading]     = useState(false)

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res  = await fetch("/api/patient/send-otp", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to send code")

            setPatientId(data.patientId)
            setStep("otp")
            toast.success("Code sent to your email and phone")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res  = await fetch("/api/patient/verify-otp", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ patientId, code }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Invalid code")

            toast.success(`Welcome back, ${data.patient.fullName}`)
            router.push("/patient/dashboard")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">

                <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Logo />
                </header>

                <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full max-w-sm space-y-6">

                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-primary dark:bg-white flex items-center justify-center">
                                    <UserCircle className="h-6 w-6 text-white dark:text-zinc-900" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-primary dark:text-white">
                                    Patient Portal
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    {step === "email"
                                        ? "Enter your email to receive a login code"
                                        : `Code sent to ${email}`}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
                            {step === "email" ? (
                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Email address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="kofi@example.com"
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <SubmitButton isLoading={loading} loadingText="Sending code...">
                                        Send login code
                                    </SubmitButton>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-4">
                                    <div>
                                        <label className={labelClass}>6-digit code</label>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder="000000"
                                            className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <SubmitButton isLoading={loading} loadingText="Verifying...">
                                        Sign in
                                    </SubmitButton>
                                    <button
                                        type="button"
                                        onClick={() => { setStep("email"); setCode("") }}
                                        className="w-full text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        Use a different email
                                    </button>
                                </form>
                            )}
                        </div>

                        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                            Don't have an account?{" "}
                            <a href="/" className="text-primary hover:underline">Register here</a>
                        </p>

                    </div>
                </div>

                <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    © {new Date().getFullYear()} CarePulse
                </footer>

            </div>
        </>
    )
}