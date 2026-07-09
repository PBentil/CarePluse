import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendSMS } from "@/lib/notification"

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug }  = await params
        const { email } = await req.json()

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        const patient = await prisma.patient.findFirst({
            where: { email: { equals: email, mode: "insensitive" }, hospitalId: hospital.id },
        })
        if (!patient) return NextResponse.json({ error: "No account found with that email" }, { status: 404 })

        await prisma.patientOTP.updateMany({ where: { patientId: patient.id, used: false }, data: { used: true } })

        const code      = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await prisma.patientOTP.create({ data: { patientId: patient.id, code, expiresAt } })

        await Promise.all([
            sendEmail({
                to:      email,
                subject: `Your ${hospital.name} login code`,
                html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;"><h2>Your login code</h2><p>Hi ${patient.fullName},</p><p>Use this code to sign in:</p><div style="background:#f4f4f5;border-radius:12px;padding:24px;margin:24px 0;text-align:center;"><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;margin:0;">${code}</p></div><p style="color:#71717a;font-size:13px;">Expires in 10 minutes.</p></div>`,
            }),
            sendSMS(patient.phone, `Your ${hospital.name} login code is ${code}. Expires in 10 minutes.`),
        ])

        return NextResponse.json({ message: "Code sent", patientId: patient.id })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
