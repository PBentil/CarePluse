import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const { patientId, code } = await req.json()

        if (!patientId || !code) {
            return NextResponse.json({ error: "Patient ID and code are required" }, { status: 400 })
        }

        const otp = await prisma.patientOTP.findFirst({
            where: {
                patientId,
                code,
                used:      false,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otp) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 })
        }

        await prisma.patientOTP.update({
            where: { id: otp.id },
            data:  { used: true },
        })

        const patient = await prisma.patient.findUnique({
            where:  { id: patientId },
            select: { id: true, fullName: true, email: true },
        })

        const response = NextResponse.json({ message: "Login successful", patient })

        response.cookies.set("patient", patientId, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24 * 7,
    })
        response.cookies.set("patientName", patient!.fullName, {
        httpOnly: false,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24 * 7,
    })

        return response
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
