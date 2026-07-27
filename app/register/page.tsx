
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import { Loader2, Check } from "lucide-react"
import { PLANS, PlanKey } from "@/lib/plans"

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

type Step = "details" | "plan" | "payment"

interface FormData {
    name:    string
    email:   string
    phone:   string
    address: string
    plan:    PlanKey
}

export default function RegisterPage() {
    const router  = useRouter()
    const [step, setStep]     = useState<Step>("details")
    const [loading, setLoading] = useState(false)
    const [form, setForm]     = useState<FormData>({
        name: "", email: "", phone: "", address: "", plan: "starter",
    })

    const update = (field: keyof FormData, value: string) =>
        setForm(f => ({ ...f, [field]: value }))

    const handleDetailsNext = () => {
        if (!form.name || !form.email || !form.phone) {
            toast.error("Please fill in all required fields")
            return
        }
        setStep("plan")
    }

    const handlePlanNext = () => setStep("payment")

    const handlePayment = async () => {
        setLoading(true)
        try {
            const plan     = PLANS[form.plan]
            const reference = `CP-REG-${Date.now()}`

            const handler = (window as any).PaystackPop.setup({
                key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
                email:    form.email,
                amount:   plan.price * 100,
                currency: "GHS",
                ref:      reference,
                onSuccess: async (transaction: { reference: string }) => {
                    try {
                        const res = await fetch("/api/hospitals", {
                            method:  "POST",
                            headers: { "Content-Type": "application/json" },
                            body:    JSON.stringify({ ...form, paystackRef: transaction.reference }),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error)
                        toast.success("Hospital registered! Check your email for login details.")
                        router.push(`/${data.hospital.slug}/admin/login`)
                    } catch (error: unknown) {
                        toast.error(error instanceof Error ? error.message : "Registration failed")
                    } finally {
                        setLoading(false)
                    }
                },
                onCancel: () => {
                    toast.error("Payment cancelled")
                    setLoading(false)
                },
            })
            handler.openIframe()
        } catch {
            setLoading(false)
        }
    }

    const handleTrial = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/hospitals", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ ...form, plan: "starter" }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Trial started! Check your email for login details.")
            router.push(`/${data.hospital.slug}/admin/login`)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <Logo />
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg space-y-8">

                    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
                        {(["details", "plan", "payment"] as Step[]).map((s, i) => (
                            <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                                    step === s
                                        ? "bg-primary text-white"
                                        : ["plan", "payment"].indexOf(step) > ["details", "plan", "payment"].indexOf(s)
                                            ? "bg-emerald-500 text-white"
                                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                }`}>
                                    {["plan", "payment"].indexOf(step) > ["details", "plan", "payment"].indexOf(s)
                                        ? <Check className="h-3.5 w-3.5" />
                                        : i + 1
                                    }
                                </div>
                                <span className={`text-xs ${step === s ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-400"}`}>
                                    {s === "details" ? "Hospital details" : s === "plan" ? "Choose plan" : "Payment"}
                                </span>
                                {i < 2 && <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700 mx-1" />}
                            </div>
                        ))}
                    </div>

                    {step === "details" && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Hospital details</h2>
                                <p className="text-sm text-zinc-400 mt-1">Tell us about your hospital</p>
                            </div>
                            <div>
                                <label className={labelClass}>Hospital name *</label>
                                <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Accra Medical Centre" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email address *</label>
                                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="admin@hospital.com" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone number *</label>
                                <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+233 ..." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Address</label>
                                <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Street, City" className={inputClass} />
                            </div>
                            <button onClick={handleDetailsNext} className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                                Continue
                            </button>
                        </div>
                    )}

                    {step === "plan" && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Choose a plan</h2>
                                <p className="text-sm text-zinc-400 mb-4">All plans include a 14-day trial</p>

                                <div className="space-y-3">
                                    {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => (
                                        <label key={key} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value={key}
                                                checked={form.plan === key}
                                                onChange={() => update("plan", key)}
                                                className="sr-only peer"
                                            />
                                            <div className={`rounded-xl border-2 p-4 transition-colors ${
                                                form.plan === key
                                                    ? "border-primary bg-primary/5"
                                                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{plan.name}</p>
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                        GH₵ {plan.price.toLocaleString()}<span className="text-xs font-normal text-zinc-400">/mo</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {plan.features.map(f => (
                                                        <span key={f} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                            <Check className="h-3 w-3 text-emerald-500" /> {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep("details")} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    Back
                                </button>
                                <button onClick={handlePlanNext} className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "payment" && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-5">
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Complete setup</h2>
                                <p className="text-sm text-zinc-400 mt-1">Review and pay to activate your hospital</p>
                            </div>

                            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Hospital</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">{form.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Plan</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">{PLANS[form.plan].name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Amount</span>
                                    <span className="font-semibold text-zinc-900 dark:text-white">GH₵ {PLANS[form.plan].price.toLocaleString()}/month</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Pay GH₵ {PLANS[form.plan].price.toLocaleString()} & activate
                                </button>
                                <button
                                    onClick={handleTrial}
                                    disabled={loading}
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                >
                                    Start 14-day trial instead
                                </button>
                            </div>

                            <button onClick={() => setStep("plan")} className="w-full text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                                ← Back to plan selection
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-zinc-100 p-4 space-y-3">
                        <p className="text-xs text-zinc-500 text-center">Already have an account? Enter your hospital name to sign in</p>
                        <div className="flex gap-2">
                            <input
                                id="signin-slug"
                                placeholder="e.g. demo-hospital"
                                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                onClick={() => {
                                    const slug = (document.getElementById("signin-slug") as HTMLInputElement)?.value?.trim()
                                    if (slug) window.location.href = `/${slug}`
                                    else toast.error("Please enter your hospital name")
                                }}
                                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Go →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
                © {new Date().getFullYear()} CarePulse · Powering modern healthcare
            </footer>
        </div>
    )
}
