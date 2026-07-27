
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export function SubscriptionBanner() {
    const { slug } = useParams<{ slug: string }>()
    const [status, setStatus]   = useState<string | null>(null)
    const [expiry, setExpiry]   = useState<string | null>(null)
    const [daysLeft, setDaysLeft] = useState<number | null>(null)

    useEffect(() => {
        fetch(`/api/${slug}/admin/dashboard`)
            .then(r => r.json())
            .then(data => {
                if (data.hospital) {
                    setStatus(data.hospital.subscriptionStatus)
                    if (data.hospital.subscriptionExpiry) {
                        const exp  = new Date(data.hospital.subscriptionExpiry)
                        const now  = new Date()
                        const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        setDaysLeft(days)
                        setExpiry(exp.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))
                    }
                }
            })
            .catch(() => {})
    }, [slug])

    if (!status) return null

    if (status === "expired") {
        return (
            <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                    Your subscription has expired. Please renew to continue using CarePulse.
                </p>
                <a href="mailto:admin@carepulse.app" className="underline text-sm font-medium">
                    Contact support →
                </a>
            </div>
        )
    }

    if (status === "trial" && daysLeft !== null && daysLeft <= 3) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-3 flex items-center justify-center gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                    Your trial expires {daysLeft <= 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`} ({expiry}).
                </p>
                <a href="mailto:admin@carepulse.app" className="underline text-sm font-medium">
                    Upgrade now →
                </a>
            </div>
        )
    }

    return null
}
