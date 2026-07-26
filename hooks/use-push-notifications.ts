
"use client"

import { useEffect, useState } from "react"

interface UsePushNotificationsProps {
    slug:     string
    userId:   string
    userType: "doctor" | "patient" | "staff"
}

export function usePushNotifications({ slug, userId, userType }: UsePushNotificationsProps) {
    const [permission, setPermission] = useState<NotificationPermission>("default")
    const [subscribed, setSubscribed] = useState(false)

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission)
            if (Notification.permission === "granted") checkSubscription()
        }
    }, [])

    const checkSubscription = async () => {
        if (!("serviceWorker" in navigator)) return
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        setSubscribed(!!sub)
    }

    const subscribe = async () => {
        try {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                console.log("Push not supported")
                return
            }

            // Register service worker
            const reg = await navigator.serviceWorker.register("/sw.js")
            await navigator.serviceWorker.ready

            // Request permission
            const perm = await Notification.requestPermission()
            setPermission(perm)
            if (perm !== "granted") return

            // Subscribe to push
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            // Save to server
            await fetch("/api/push/subscribe", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    subscription: sub.toJSON(),
                    userId,
                    userType,
                    slug,
                }),
            })

            setSubscribed(true)
        } catch (error) {
            console.error("Push subscription failed:", error)
        }
    }

    const unsubscribe = async () => {
        try {
            const reg = await navigator.serviceWorker.ready
            const sub = await reg.pushManager.getSubscription()
            if (sub) {
                await fetch("/api/push/unsubscribe", {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ endpoint: sub.endpoint }),
                })
                await sub.unsubscribe()
                setSubscribed(false)
            }
        } catch (error) {
            console.error("Unsubscribe failed:", error)
        }
    }

    return { permission, subscribed, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const output  = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i)
    return output
}
