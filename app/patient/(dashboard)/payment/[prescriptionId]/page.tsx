
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, MapPin } from "lucide-react"
import type { Prescription } from "@/types"

declare global {
    interface Window {
        PaystackPop: {
            setup: (options: {
                key:       string
                email:     string
                amount:    number
                currency:  string
                ref:       string
                onSuccess: (transaction: { reference: string }) => void
                onCancel:  () => void
            }) => { openIframe: () => void }
        }
    }
}

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export default function PaymentPage() {
    const { prescriptionId } = useParams<{ prescriptionId: string }>()
    const router             = useRouter()
    const [prescription, setPrescription] = useState<Prescription | null>(null)
    const [loading, setLoading]           = useState(true)
    const [paying, setPaying]             = useState(false)
    const [address, setAddress]           = useState("")
    const [email, setEmail]               = useState("")

    useEffect(() => {
        const script = document.createElement("script")
        script.src   = "https://js.paystack.co/v1/inline.js"
        document.head.appendChild(script)

        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        fetch("/api/patient/prescriptions")
            .then(r => r.json())
            .then(data => {
                const rx = data.prescriptions?.find((p: Prescription) => p.id === prescriptionId)
                if (rx) {
                    setPrescription(rx)
                    setEmail(rx.patient?.email ?? "")
                }
                setLoading(false)
            })
    }, [prescriptionId])

    const total = prescription?.items.reduce((sum, i) => sum + i.price, 0) ?? 0

    const handlePay = () => {
        if (!address.trim()) {
            toast.error("Please enter your delivery address")
            return
        }
        if (!email.trim()) {
            toast.error("Email is required for payment")
            return
        }

        setPaying(true)

        const reference = `CP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

        const handler = window.PaystackPop.setup({
            key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
            email,
            amount:   Math.round(total * 100),
            currency: "GHS",
            ref:      reference,
            onSuccess: async (transaction) => {
                try {
                    const res = await fetch("/api/patient/payment", {
                        method:  "POST",
                        headers: { "Content-Type": "application/json" },
                        body:    JSON.stringify({
                            reference:      transaction.reference,
                            prescriptionId,
                            deliveryAddress: address,
                        }),
                    })

                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error)

                    toast.success("Payment successful! Your order is being prepared.")
                    router.push("/patient/orders")
                } catch (error: unknown) {
                    toast.error(error instanceof Error ? error.message : "Payment verification failed")
                } finally {
                    setPaying(false)
                }
            },
            onCancel: () => {
                toast.error("Payment cancelled")
                setPaying(false)
            },
        })

        handler.openIframe()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!prescription) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-zinc-400">Prescription not found</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Complete payment</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Review your order and enter delivery details
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Order summary</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Dr. {prescription.doctor?.name}</p>
                </div>
                <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {prescription.items.map(item => (
                        <div key={item.id} className="px-6 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-900 dark:text-white">
                                    {item.drugName} <span className="text-zinc-400">{item.dosage}</span>
                                </p>
                                <p className="text-xs text-zinc-400">{item.frequency} · {item.duration}</p>
                            </div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                GH₵ {item.price.toFixed(2)}
                            </p>
                        </div>
                    ))}
                    <div className="px-6 py-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Total</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            GH₵ {total.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Delivery details</p>
                </div>

                <div>
                    <label className={labelClass}>Email address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Delivery address</label>
                    <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="House number, street, area, city..."
                        rows={3}
                        className={inputClass}
                    />
                </div>
            </div>

            <button
                onClick={handlePay}
                disabled={paying || !address.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
                {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                {paying ? "Processing..." : `Pay GH₵ ${total.toFixed(2)}`}
            </button>

            <p className="text-center text-xs text-zinc-400">
                Secured by Paystack · Mobile Money & Card accepted
            </p>
        </div>
    )
}
