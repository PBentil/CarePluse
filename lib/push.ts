import webpush from "web-push"

webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
)

export interface PushPayload {
    title:  string
    body:   string
    icon?:  string
    badge?: string
    url?:   string
}

export async function sendPushNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushPayload
) {
    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth:   subscription.auth,
                },
            },
            JSON.stringify({
                title:  payload.title,
                body:   payload.body,
                icon:   payload.icon  ?? "/favicon.svg",
                badge:  payload.badge ?? "/favicon.svg",
                url:    payload.url   ?? "/",
            })
        )
    } catch (error) {
        console.error("Push notification failed:", error)
    }
}

export async function sendPushToUsers(
    subscriptions: { endpoint: string; p256dh: string; auth: string }[],
    payload: PushPayload
) {
    await Promise.allSettled(subscriptions.map(sub => sendPushNotification(sub, payload)))
}
