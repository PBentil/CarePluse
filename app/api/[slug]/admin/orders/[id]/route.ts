import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"
import { sendEmail, sendSMS } from "@/lib/notification"
import { sendPushToUsers } from "@/lib/push"
import { sendPushToUsers } from "@/lib/push"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { status } = await req.json()

        const existing = await prisma.order.findUnique({
            where: { id },
            include: { patient: { select: { fullName: true, email: true, phone: true } } },
        })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const updated = await prisma.order.update({
            where: { id }, data: { status },
            include: { patient: { select: { fullName: true, email: true, phone: true } }, prescription: { include: { items: true } } },
        })

        const messages: Record<string, { sms: string; subject: string; body: string }> = {
            on_the_way: { sms: `Hi ${existing.patient.fullName}, your order is on the way to ${existing.deliveryAddress}.`, subject: "Your Order Is On The Way", body: `Your drugs are on the way to <strong>${existing.deliveryAddress}</strong>.` },
            delivered:  { sms: `Hi ${existing.patient.fullName}, your order has been delivered!`, subject: "Order Delivered", body: `Your drugs have been delivered to <strong>${existing.deliveryAddress}</strong>.` },
        }

        if (messages[status]) {
            const { sms, subject, body } = messages[status]
            const patientSubs = await prisma.pushSubscription.findMany({
                where: { userId: existing.patientId, userType: "patient" },
            })
            await Promise.all([
                sendSMS(existing.patient.phone, sms),
                sendEmail({ to: existing.patient.email, subject, html: `<div style="font-family:sans-serif;padding:32px;"><h2>${subject}</h2><p>Hi ${existing.patient.fullName},</p><p>${body}</p></div>` }),
                sendPushToUsers(patientSubs, { title: subject, body: sms, url: `/${slug}/patient/orders` }),
            ])
        }

        return NextResponse.json(updated)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
