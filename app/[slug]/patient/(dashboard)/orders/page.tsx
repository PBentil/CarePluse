
"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Package, Truck, CheckCircle2 } from "lucide-react"
import { PageHeader } from "@/components/admin/page-header"

interface Order {
    id: string; status: string; deliveryAddress: string; totalAmount: number; createdAt: string
    prescription?: { items: { id: string; drugName: string; dosage: string; frequency: string }[]; doctor?: { name: string } }
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    packed:     { label: "Order packed",   icon: Package,      color: "text-amber-600",   bg: "bg-amber-50" },
    on_the_way: { label: "On the way",     icon: Truck,        color: "text-blue-600",    bg: "bg-blue-50" },
    delivered:  { label: "Delivered",      icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
}
const steps = ["packed", "on_the_way", "delivered"]

export default function PatientOrdersPage() {
    const { slug } = useParams<{ slug: string }>()
    const [orders, setOrders]   = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/patient/orders`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setOrders(data.orders)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }, [slug])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    return (
        <div className="space-y-6">
            <PageHeader title="My Orders" />
            {loading ? (
                <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-zinc-100 animate-pulse" />)}</div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center">
                    <Package className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const currentStep = steps.indexOf(order.status)
                        const config      = statusConfig[order.status]
                        const Icon        = config?.icon ?? Package

                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${config?.bg ?? ""}`}>
                                        <Icon className={`h-3.5 w-3.5 ${config?.color ?? ""}`} />
                                        <span className={`text-xs font-medium ${config?.color ?? ""}`}>{config?.label ?? order.status}</span>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="flex items-center gap-0 mb-6">
                                        {steps.map((step, i) => {
                                            const done     = i <= currentStep
                                            const StepIcon = statusConfig[step]?.icon ?? Package
                                            return (
                                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary" : "bg-zinc-100"}`}>
                                                        <StepIcon className={`h-4 w-4 ${done ? "text-white" : "text-zinc-400"}`} />
                                                    </div>
                                                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-primary" : "bg-zinc-100"}`} />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="space-y-1">
                                        {order.prescription?.items.map(item => (
                                            <p key={item.id} className="text-xs text-zinc-600">{item.drugName} {item.dosage} · {item.frequency}</p>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
                                        <p className="text-xs text-zinc-400">{order.deliveryAddress}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-semibold text-zinc-900">GH₵ {order.totalAmount.toFixed(2)}</p>
                                            {order.status === "delivered" && (
                                                <a
                                                    href={`/api/${slug}/patient/orders/${order.id}/invoice`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Receipt
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
