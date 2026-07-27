import { Logo } from "@/components/logo"
import { CalendarCheck2 } from "lucide-react"
import Link from "next/link"

export default async function ConfirmationPage({
                                                   params,
                                               }: {
    params: Promise<{ patientId: string }>
}) {
    const { patientId } = await params

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">

            <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
                <Logo />
            </header>

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-md text-center space-y-8">

                    <div className="flex justify-center">
                        <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-5">
                            <CalendarCheck2 className="h-12 w-12 text-blue-500" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                            Appointment Requested!
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Your appointment request has been submitted. You&#39;ll receive an SMS
                            and email once the team reviews and confirms your booking.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800" />

                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 text-left space-y-2">
                        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            What happens next
                        </p>
                        {[
                            "Our team reviews your request within 24 hours.",
                            "You'll be notified via SMS and email with a confirmation.",
                            "If rescheduling is needed, we'll reach out directly.",
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                  {i + 1}
                </span>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">{step}</p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href={`/appointments/${patientId}`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium bg-primary text-white dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Book another appointment
                    </Link>

                </div>
            </div>

            <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                © {new Date().getFullYear()} CarePulse
            </footer>

        </div>
    )
}