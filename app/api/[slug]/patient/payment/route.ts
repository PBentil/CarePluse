import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { reference, prescriptionId, deliveryAddress } = await req.json()

        const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        })
        const verifyData = await verify.json()
        if (!verifyData.status || verifyData.data.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
        }

        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: { items: true, patient: { select: { fullName: true, email: true, phone: true } } },
        })
        if (!prescription) return NextResponse.json({ error: "Prescription not found" }, { status: 404 })

        const totalAmount = prescription.items.reduce((sum, i) => sum + i.price, 0)

        const [order] = await prisma.$transaction([
            prisma.order.create({
                data: { hospitalId: patient.hospitalId, prescriptionId, patientId: patient.id, deliveryAddress, status: "packed", totalAmount, paystackRef: reference },
            }),
            prisma.prescription.update({ where: { id: prescriptionId }, data: { status: "paid" } }),
        ])

        await Promise.all([
            sendSMS(prescription.patient.phone, `Hi ${prescription.patient.fullName}, payment of GH${totalAmount.toFixed(2)} confirmed. Order is being prepared. – CarePulse`),
            sendEmail({
                to:      prescription.patient.email,
                subject: "Payment Confirmed – CarePulse",
                html:    `<div style="font-family:sans-serif;padding:32px;"><h2>Payment Confirmed</h2><p>Hi ${prescription.patient.fullName},</p><p>Your payment of GH${totalAmount.toFixed(2)} has been confirmed. Order ID: #${order.id.slice(0, 8).toUpperCase()}</p></div>`,
            }),
        ])

        return NextResponse.json({ order })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
