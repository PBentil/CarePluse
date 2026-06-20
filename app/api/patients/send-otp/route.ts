import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendSMS } from "@/lib/notification"

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const patient = await prisma.patient.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
        })

        if (!patient) {
            return NextResponse.json({ error: "No account found with that email" }, { status: 404 })
        }

        // Invalidate any existing unused OTPs
        await prisma.patientOTP.updateMany({
            where: { patientId: patient.id, used: false },
            data:  { used: true },
        })

        const code      = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.patientOTP.create({
            data: { patientId: patient.id, code, expiresAt },
        })

        await Promise.all([
            sendEmail({
                to:      email,
                subject: "Your CarePulse login code",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                        <h2 style="color:#18181b;font-size:18px;">Your login code</h2>
                        <p style="color:#71717a;">Hi ${patient.fullName},</p>
                        <p style="color:#71717a;">Use the code below to sign in to CarePulse. It expires in 10 minutes.</p>
                        <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
                            <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#18181b;margin:0;">${code}</p>
                        </div>
                        <p style="color:#71717a;font-size:13px;">If you didn't request this, ignore this email.</p>
                        <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
                    </div>
                `,
            }),
            sendSMS(patient.phone, `Your CarePulse login code is ${code}. It expires in 10 minutes.`),
        ])

        return NextResponse.json({ message: "Code sent", patientId: patient.id })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}