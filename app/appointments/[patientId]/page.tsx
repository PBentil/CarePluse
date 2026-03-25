"use client"
import { Logo } from "@/components/logo"
import Image from "next/image"
import AppointmentForm from "@/components/forms/appointment-forms"

export default async function AppointmentPage({
                                                  params,
                                              }: {
    params: Promise<{ patientId: string }>
}) {
    const { patientId } = await params

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 grid grid-cols-1 lg:grid-cols-5">

            <section className="lg:col-span-3 flex flex-col min-h-screen">

                <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
                    <Logo />
                </header>

                <div className="flex flex-1 items-start justify-center px-6 py-12">
                    <div className="w-full max-w-xl space-y-8">

                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                                Book an Appointment
                            </h1>
                            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                Choose a doctor and a time that works for you.
                            </p>
                        </div>

                        <AppointmentForm patientId={patientId} />

                    </div>
                </div>

                <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    © {new Date().getFullYear()} CarePulse
                </footer>

            </section>

            <div className="hidden lg:block lg:col-span-2 relative">
                <div className="sticky top-0 h-screen">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <Image
                        src="/assets/images/onboarding.png"
                        alt="Doctor"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute bottom-8 left-6 right-6 z-20">
                        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white">
                            <p className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">
                                Your Care Team
                            </p>
                            <p className="text-lg font-semibold leading-snug">
                                Expert doctors, ready when you are.
                            </p>
                            <p className="text-sm opacity-60 mt-1">
                                All appointments are reviewed within 24 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}