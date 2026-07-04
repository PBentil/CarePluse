import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id }     = await params
        const { status } = await req.json()

        const existing = await prisma.order.findUnique({
            where:   { id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
            },
        })

        if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const updated = await prisma.order.update({
            where: { id },
            data:  { status },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                prescription: { include: { items: true, doctor: { select: { name: true } } } },
            },
        })

        const statusMessages: Record<string, { sms: string; subject: string; body: string }> = {
            on_the_way: {
                sms:     `Hi ${existing.patient.fullName}, your order is on the way! Your drugs are being delivered to ${existing.deliveryAddress}. – CarePulse`,
                subject: "Your Order Is On The Way – CarePulse",
                body:    `Your drugs are on the way to <strong>${existing.deliveryAddress}</strong>. Please be available to receive your order.`,
            },
            delivered: {
                sms:     `Hi ${existing.patient.fullName}, your order has been delivered! Please confirm receipt. – CarePulse`,
                subject: "Order Delivered – CarePulse",
                body:    `Your drugs have been delivered to <strong>${existing.deliveryAddress}</strong>. Thank you for using CarePulse.`,
            },
        }

        if (statusMessages[status]) {
            const { sms, subject, body } = statusMessages[status]
            await Promise.all([
                sendSMS(existing.patient.phone, sms),
                sendEmail({
                    to: existing.patient.email,
                    subject,
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                            <h2 style="color:#18181b;font-size:18px;">${subject}</h2>
                            <p style="color:#71717a;">Hi <strong>${existing.patient.fullName}</strong>,</p>
                            <p style="color:#71717a;">${body}</p>
                            <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
                        </div>
                    `,
                }),
            ])
        }

        return NextResponse.json(updated)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
