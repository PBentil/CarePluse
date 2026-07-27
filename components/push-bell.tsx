
"use client"

import { Bell, BellOff } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useEffect, useState } from "react"

interface PushBellProps {
    slug:     string
    userId:   string
    userType: "doctor" | "patient" | "staff"
}

export function PushBell({ slug, userId, userType }: PushBellProps) {
    const [mounted, setMounted] = useState(false)
    const { permission, subscribed, subscribe, unsubscribe } = usePushNotifications({ slug, userId, userType })

    useEffect(() => { setMounted(true) }, [])

    if (!mounted) return null
    if (typeof window === "undefined") return null
    if (!("Notification" in window)) return null
    if (permission === "denied") return null

    return (
        <button
            onClick={subscribed ? unsubscribe : subscribe}
            title={subscribed ? "Disable notifications" : "Enable notifications"}
            className={`relative h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                subscribed
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
            }`}
        >
            {subscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {subscribed && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
        </button>
    )
}
