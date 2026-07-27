
"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import {
    Users, Calendar, Video, FlaskConical, Pill, CreditCard,
    Package, Shield, Stethoscope, UserCog, ArrowRight,
    Bell, FileText, Activity, Clock
} from "lucide-react"

const portalFeatures = [
    {
        portal: "Hospital Admin",
        color:  "text-purple-600",
        bg:     "bg-purple-50 dark:bg-purple-950",
        icon:   Shield,
        features: [
            "Full hospital overview dashboard",
            "Add and manage doctors with role-based access",
            "Add staff — nurses, receptionists, pharmacists",
            "View all patients across the hospital",
            "Monitor all appointments and their status",
            "Manage lab tests and upload results",
            "View and process prescriptions",
            "Manage the drug catalogue with pricing",
            "Track and update delivery orders",
            "Hospital settings and subscription management",
        ],
    },
    {
        portal: "Doctor",
        color:  "text-blue-600",
        bg:     "bg-blue-50 dark:bg-blue-950",
        icon:   Stethoscope,
        features: [
            "Personal dashboard with today's appointments",
            "View assigned patients with full medical history",
            "Set weekly availability schedule with time slots",
            "Confirm, reject, or reschedule appointments",
            "Video consultations via Daily.co",
            "Write consultation notes and diagnosis",
            "Order lab tests from the catalogue",
            "Issue digital prescriptions from drug catalogue",
            "View lab test results for their patients",
        ],
    },
    {
        portal: "Patient",
        color:  "text-emerald-600",
        bg:     "bg-emerald-50 dark:bg-emerald-950",
        icon:   Users,
        features: [
            "OTP-based login — no password needed",
            "View appointment status in real time",
            "Join video consultations with one click",
            "Upload lab test results from external labs",
            "View doctor-ordered lab test results",
            "View itemised digital prescriptions",
            "Pay online via Mobile Money or card",
            "Track drug delivery — Packed → On the way → Delivered",
        ],
    },
]

const allFeatures = [
    { icon: Calendar,    title: "Slot-based appointment booking",   description: "Doctors set their weekly availability. Patients pick from real open slots — no double booking possible." },
    { icon: Video,       title: "HD video consultations",           description: "Secure video rooms auto-created when appointments are confirmed. Both doctor and patient get a join link." },
    { icon: FlaskConical,title: "Lab test management",              description: "Doctors order tests digitally. Patients upload results from external labs or receive them from admin." },
    { icon: Pill,        title: "Digital prescriptions",            description: "Itemised drug lists with dosage, frequency, duration, and pricing pulled from the hospital drug catalogue." },
    { icon: CreditCard,  title: "Online payments",                  description: "Paystack integration — Mobile Money (MTN, Vodafone) and card. Payment confirmation triggers pharmacy." },
    { icon: Package,     title: "Drug delivery tracking",           description: "Real-time status updates: Packed, On the Way, Delivered. SMS + email at every stage." },
    { icon: Bell,        title: "SMS & email notifications",        description: "Automated Twilio SMS and email at every step — appointment confirmed, lab results ready, order delivered." },
    { icon: Shield,      title: "Role-based access control",        description: "7 roles: super admin, hospital admin, doctor, nurse, receptionist, pharmacist, patient. Each sees only what they need." },
    { icon: FileText,    title: "Digital patient intake",           description: "Full medical history, emergency contacts, insurance, ID document upload, and consent forms." },
    { icon: Activity,    title: "Real-time dashboards",             description: "Stats for patients, appointments, lab tests, and more — updated in real time for admins and doctors." },
    { icon: Clock,       title: "Doctor availability scheduling",   description: "Doctors configure their working hours and slot durations per day. System enforces availability automatically." },
    { icon: UserCog,     title: "Multi-role staff management",      description: "Add nurses, receptionists, and pharmacists with appropriate access levels. Manage all from one place." },
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <nav className="border-b border-zinc-100 dark:border-zinc-800 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
                <Logo />
                <div className="flex items-center gap-6">
                    <Link href="/pricing" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</Link>
                    <Link href="/register" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Register</Link>
                </div>
            </nav>

            <section className="pt-16 pb-8 px-6 text-center max-w-2xl mx-auto space-y-4">
                <p className="text-xs font-medium text-primary uppercase tracking-widest">Features</p>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Everything in one platform</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">CarePulse covers the complete patient journey — from registration to drug delivery — with dedicated portals for every role.</p>
            </section>

            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {portalFeatures.map(({ portal, color, bg, icon: Icon, features }) => (
                        <div key={portal} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{portal} Portal</h3>
                            <ul className="space-y-2">
                                {features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${bg} ${color} shrink-0`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-10">Full feature breakdown</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {allFeatures.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 bg-primary text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
                <p className="text-sm text-white/70 max-w-md mx-auto">Register your hospital today and be live within minutes.</p>
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary text-sm font-medium hover:bg-zinc-100 transition-colors">
                    Register your hospital <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            <footer className="border-t border-zinc-100 dark:border-zinc-800 py-8 text-center text-xs text-zinc-400">
                © {new Date().getFullYear()} CarePulse · <Link href="/" className="hover:text-zinc-600 transition-colors">Back to home</Link>
            </footer>
        </div>
    )
}
