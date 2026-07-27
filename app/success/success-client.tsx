"use client"

import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { CheckCircle2, CalendarDays } from "lucide-react"

interface SuccessClientProps {
    patientId: string
    fullName: string
}

export default function SuccessClient({ patientId, fullName }: SuccessClientProps) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
                <Logo />
            </header>

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-md text-center space-y-8">

                    <div className="flex justify-center">
                        <div className="rounded-full bg-emerald-50 dark:bg-emerald-950 p-5">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                            You&#39;re all set, {fullName?.split(" ")[0] ?? "there"}!
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Your intake information has been securely submitted.
                            A member of our team will review your details shortly.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800" />

                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 text-left space-y-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            Next step
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Book an appointment with one of our physicians. We&#39;ll match you
                            with the right specialist based on your intake form.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            console.log("patientId:", patientId)
                            router.push(`/appointments/${patientId}`)
                        }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
                    >
                        <CalendarDays className="h-4 w-4" />
                        Schedule an Appointment
                    </button>

                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                        Need help? Contact us at{" "}
                        <a href="mailto:support@carepulse.com" className="underline hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
                            support@carepulse.com
                        </a>
                    </p>

                </div>
            </div>

            <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-sm text-zinc-400 dark:text-zinc-500">
                © {new Date().getFullYear()} CarePulse — Your health, our priority.
            </footer>

        </div>
    )
}