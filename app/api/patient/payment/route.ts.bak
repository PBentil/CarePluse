import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function POST(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { reference, prescriptionId, deliveryAddress } = await req.json()

        if (!reference || !prescriptionId || !deliveryAddress) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        })

        const verifyData = await verify.json()

        if (!verifyData.status || verifyData.data.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        const prescription = await prisma.prescription.findUnique({
            where:   { id: prescriptionId },
            include: {
                items:   true,
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true } },
            },
        })

        if (!prescription) {
            return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
        }

        const totalAmount = prescription.items.reduce((sum, i) => sum + i.price, 0)

        const [order] = await prisma.$transaction([
            prisma.order.create({
                data: {
                    prescriptionId,
                    patientId,
                    deliveryAddress,
                    status:      "packed",
                    totalAmount,
                    paystackRef: reference,
                },
            }),
            prisma.prescription.update({
                where: { id: prescriptionId },
                data:  { status: "paid" },
            }),
        ])

        const drugList = prescription.items.map(i => `${i.drugName} ${i.dosage}`).join(", ")
        const sms = `Hi ${prescription.patient.fullName}, your payment of GH₵${totalAmount.toFixed(2)} was successful. Your order is being prepared. Drugs: ${drugList}. – CarePulse`
        const email = {
            to:      prescription.patient.email,
            subject: "Payment Confirmed – CarePulse",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                    <h2 style="color:#18181b;font-size:18px;">Payment Confirmed ✓</h2>
                    <p style="color:#71717a;">Hi <strong>${prescription.patient.fullName}</strong>,</p>
                    <p style="color:#71717a;">Your payment of <strong>GH₵${totalAmount.toFixed(2)}</strong> has been confirmed.</p>
                    <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:16px 0;">
                        <p style="margin:4px 0;color:#18181b;"><strong>Order ID:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Delivery to:</strong> ${deliveryAddress}</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Status:</strong> Order packed</p>
                    </div>
                    <p style="color:#71717a;font-size:13px;">We will notify you when your order is on the way.</p>
                    <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
                </div>
            `,
        }

        await Promise.all([sendSMS(prescription.patient.phone, sms), sendEmail(email)])

        return NextResponse.json({ order })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
