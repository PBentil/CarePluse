
"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Check, ArrowRight } from "lucide-react"

const plans = [
    {
        name:        "Starter",
        price:       500,
        description: "Perfect for small clinics getting started with digital healthcare.",
        features: [
            "1 clinic branch",
            "Up to 5 doctors",
            "Unlimited patients",
            "Patient registration & intake",
            "Appointment booking with availability",
            "Video consultations (Daily.co)",
            "Lab test ordering & results",
            "Digital prescriptions",
            "Drug catalogue",
            "Online payments (Paystack)",
            "Drug delivery tracking",
            "SMS & email notifications",
            "Email support",
        ],
        notIncluded: ["Multiple branches", "Custom branding", "Priority support"],
        cta:     "Start free trial",
        popular: false,
    },
    {
        name:        "Growth",
        price:       1500,
        description: "For growing hospitals with multiple branches and larger teams.",
        features: [
            "Up to 5 clinic branches",
            "Up to 25 doctors",
            "Unlimited patients",
            "Everything in Starter",
            "Multi-branch management",
            "Staff roles (nurse, receptionist, pharmacist)",
            "Custom branding",
            "Priority support",
            "Advanced reporting",
        ],
        notIncluded: ["Unlimited branches", "Dedicated support", "Custom integrations"],
        cta:     "Start free trial",
        popular: true,
    },
    {
        name:        "Enterprise",
        price:       4000,
        description: "For large hospital networks that need full control and dedicated support.",
        features: [
            "Unlimited clinic branches",
            "Unlimited doctors & staff",
            "Unlimited patients",
            "Everything in Growth",
            "Dedicated account manager",
            "SLA guarantee",
            "Custom integrations",
            "On-site training",
            "Custom contracts",
        ],
        notIncluded: [],
        cta:     "Contact us",
        popular: false,
    },
]

const faqs = [
    { q: "Is there a free trial?", a: "Yes — all plans include a 14-day free trial with no credit card required." },
    { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade your plan at any time from your hospital settings." },
    { q: "What payment methods are accepted?", a: "We accept Mobile Money (MTN, Vodafone, AirtelTigo) and card payments via Paystack." },
    { q: "Is my data secure?", a: "Yes. Each hospital's data is fully isolated. We use encrypted connections and secure cookie-based authentication." },
    { q: "Can I add more branches later?", a: "Yes. You can add branches at any time within your plan limits." },
    { q: "What happens when my subscription expires?", a: "Your portal will be locked until you renew. Your data is preserved for 30 days." },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <nav className="border-b border-zinc-100 dark:border-zinc-800 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
                <Logo />
                <div className="flex items-center gap-6">
                    <Link href="/features" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Features</Link>
                    <Link href="/register" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Register</Link>
                </div>
            </nav>

            <section className="pt-16 pb-8 px-6 text-center max-w-2xl mx-auto space-y-4">
                <p className="text-xs font-medium text-primary uppercase tracking-widest">Pricing</p>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Simple, transparent pricing</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Start with a 14-day free trial. No credit card required. Cancel anytime.</p>
            </section>

            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {plans.map(({ name, price, description, features, notIncluded, cta, popular }) => (
                        <div key={name} className={`rounded-2xl border p-6 space-y-5 relative ${popular ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800"}`}>
                            {popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">Most popular</span>
                                </div>
                            )}
                            <div>
                                <p className="text-base font-semibold text-zinc-900 dark:text-white">{name}</p>
                                <div className="flex items-baseline gap-1 mt-1 mb-2">
                                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">GH₵ {price.toLocaleString()}</span>
                                    <span className="text-xs text-zinc-400">/month</span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
                            </div>
                            <Link href="/register" className={`block text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${popular ? "bg-primary text-white hover:bg-primary/90" : "border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
                                {cta} {cta !== "Contact us" && <ArrowRight className="inline h-3.5 w-3.5 ml-1" />}
                            </Link>
                            <div className="space-y-2 pt-2">
                                {features.map(f => (
                                    <div key={f} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> {f}
                                    </div>
                                ))}
                                {notIncluded.map(f => (
                                    <div key={f} className="flex items-start gap-2 text-xs text-zinc-300 dark:text-zinc-600 line-through">
                                        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-16 px-6 bg-zinc-50 dark:bg-zinc-900">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">Frequently asked questions</h2>
                    <div className="space-y-4">
                        {faqs.map(({ q, a }) => (
                            <div key={q} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">{q}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-zinc-100 dark:border-zinc-800 py-8 text-center text-xs text-zinc-400">
                © {new Date().getFullYear()} CarePulse · <Link href="/" className="hover:text-zinc-600 transition-colors">Back to home</Link>
            </footer>
        </div>
    )
}
