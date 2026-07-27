
"use client"

import Link from "next/link"
import { useState } from "react"
import { Logo } from "@/components/logo"
import {
    Activity, Video, FlaskConical, Pill, CreditCard, Package,
    ChevronRight, Check, Menu, X, ArrowRight, Shield, Clock, Users
} from "lucide-react"

const features = [
    {
        icon: Video,
        title: "Live video consultations",
        description: "Patients connect with doctors face-to-face through secure, HD video calls — no third-party apps needed.",
        color: "text-blue-500",
        bg:    "bg-blue-50 dark:bg-blue-950",
    },
    {
        icon: FlaskConical,
        title: "Lab test management",
        description: "Doctors order tests digitally. Patients upload results or receive them directly from the lab.",
        color: "text-amber-500",
        bg:    "bg-amber-50 dark:bg-amber-950",
    },
    {
        icon: Pill,
        title: "Digital prescriptions",
        description: "Issue itemised prescriptions from your drug catalogue with dosage, frequency, and pricing.",
        color: "text-purple-500",
        bg:    "bg-purple-50 dark:bg-purple-950",
    },
    {
        icon: CreditCard,
        title: "Online payments",
        description: "Patients pay securely via Mobile Money (MTN, Vodafone) or card — powered by Paystack.",
        color: "text-emerald-500",
        bg:    "bg-emerald-50 dark:bg-emerald-950",
    },
    {
        icon: Package,
        title: "Drug delivery tracking",
        description: "From pharmacy to doorstep — patients track their order in real time at every stage.",
        color: "text-rose-500",
        bg:    "bg-rose-50 dark:bg-rose-950",
    },
    {
        icon: Shield,
        title: "Multi-role access control",
        description: "Separate portals for admins, doctors, nurses, receptionists, pharmacists, and patients.",
        color: "text-indigo-500",
        bg:    "bg-indigo-50 dark:bg-indigo-950",
    },
]

const steps = [
    { number: "01", title: "Register your hospital", description: "Sign up in minutes. Choose a plan, pay securely, and get instant access." },
    { number: "02", title: "Set up your team", description: "Add your doctors, nurses, receptionists, and pharmacists with role-based access." },
    { number: "03", title: "Go live", description: "Patients register and book appointments. Your hospital runs digitally from day one." },
]

const plans = [
    {
        name:     "Starter",
        price:    500,
        period:   "month",
        features: ["1 clinic branch", "Up to 5 doctors", "Unlimited patients", "All core features", "Email support"],
        cta:      "Get started",
        popular:  false,
    },
    {
        name:     "Growth",
        price:    1500,
        period:   "month",
        features: ["Up to 5 clinic branches", "Up to 25 doctors", "Unlimited patients", "All features", "Priority support", "Custom branding"],
        cta:      "Get started",
        popular:  true,
    },
    {
        name:     "Enterprise",
        price:    4000,
        period:   "month",
        features: ["Unlimited branches", "Unlimited doctors", "Unlimited patients", "All features", "Dedicated support", "SLA guarantee", "Custom integrations"],
        cta:      "Contact us",
        popular:  false,
    },
]

const stats = [
    { value: "3 min", label: "Average setup time" },
    { value: "7",     label: "Portals in one platform" },
    { value: "100%",  label: "Data isolated per hospital" },
    { value: "24/7",  label: "System availability" },
]

export default function LandingPage() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo />

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/features" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link href="/register" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Register</Link>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/register" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                            Register your hospital
                        </Link>
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700">
                        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4 space-y-3">
                        <Link href="/features" className="block text-sm text-zinc-600 dark:text-zinc-300 py-2">Features</Link>
                        <Link href="/pricing" className="block text-sm text-zinc-600 dark:text-zinc-300 py-2">Pricing</Link>
                        <Link href="/register" className="block text-sm text-zinc-600 dark:text-zinc-300 py-2">Register</Link>
                        <Link href="/register" className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">
                            Register your hospital
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                        <Activity className="h-3.5 w-3.5" />
                        Healthcare management platform for Ghana & Africa
                    </div>
                    <h1 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight tracking-tight">
                        The complete digital<br />
                        <span className="text-primary">healthcare platform</span>
                    </h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        CarePulse gives hospitals everything they need to run digitally — from patient registration to video consultations, lab tests, prescriptions, payments, and drug delivery.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                            Register your hospital <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            View pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="max-w-4xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {stats.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">How it works</p>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Up and running in minutes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {steps.map(({ number, title, description }) => (
                            <div key={number} className="space-y-3">
                                <p className="text-4xl font-bold text-primary/20">{number}</p>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Features</p>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Everything your hospital needs</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-xl mx-auto">One platform covering the entire patient journey — from registration to delivery.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {features.map(({ icon: Icon, title, description, color, bg }) => (
                            <div key={title} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-3">
                                <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/features" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            See all features <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Pricing</p>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Simple, transparent pricing</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">Start with a 14-day free trial. No credit card required.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {plans.map(({ name, price, period, features, cta, popular }) => (
                            <div key={name} className={`rounded-2xl border p-6 space-y-5 relative ${popular ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}>
                                {popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">Most popular</span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{name}</p>
                                    <div className="flex items-baseline gap-1 mt-2">
                                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">GH₵ {price.toLocaleString()}</span>
                                        <span className="text-xs text-zinc-400">/{period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`block text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${popular ? "bg-primary text-white hover:bg-primary/90" : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
                                    {cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/pricing" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            Compare all plans <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-primary">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold text-white">Ready to digitise your hospital?</h2>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed">
                        Join hospitals across Ghana using CarePulse to deliver better patient care. Start your 14-day free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/register" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary text-sm font-medium hover:bg-zinc-100 transition-colors">
                            Register your hospital <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                            View pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-3">
                            <Logo />
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                The complete digital healthcare platform for hospitals across Ghana and Africa.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Product</p>
                            <div className="space-y-2">
                                <Link href="/features" className="block text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Features</Link>
                                <Link href="/pricing" className="block text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</Link>
                                <Link href="/register" className="block text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Register</Link>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Portals</p>
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-400">Admin: /[hospital]/admin</p>
                                <p className="text-xs text-zinc-400">Doctor: /[hospital]/doctor</p>
                                <p className="text-xs text-zinc-400">Patient: /[hospital]/patient</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Company</p>
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-400">Made in Ghana 🇬🇭</p>
                                <p className="text-xs text-zinc-400">support@carepulse.app</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-zinc-400">© {new Date().getFullYear()} CarePulse. All rights reserved.</p>
                        <div className="flex items-center gap-1">
                            <Link href="/superadmin/login" className="text-xs text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 transition-colors">Super admin</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
