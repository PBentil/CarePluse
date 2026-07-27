import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const { subscription, userId, userType, slug } = await req.json()

        if (!subscription?.endpoint || !userId || !userType || !slug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh:    subscription.keys.p256dh,
                auth:      subscription.keys.auth,
                userId,
                userType,
            },
            create: {
                hospitalId: hospital.id,
                userId,
                userType,
                endpoint:   subscription.endpoint,
                p256dh:     subscription.keys.p256dh,
                auth:       subscription.keys.auth,
            },
        })

        return NextResponse.json({ message: "Subscribed" })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
