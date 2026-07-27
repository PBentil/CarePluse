import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const { patientId, code } = await req.json()

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        const otp = await prisma.patientOTP.findFirst({
            where: { patientId, code, used: false, expiresAt: { gt: new Date() } },
        })
        if (!otp) return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 })

        await prisma.patientOTP.update({ where: { id: otp.id }, data: { used: true } })

        const patient = await prisma.patient.findUnique({
            where: { id: patientId }, select: { id: true, fullName: true, email: true },
        })

        const response = NextResponse.json({ message: "Login successful", patient })

        response.cookies.set(`patient_${slug}`, patientId, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`patient_${slug}_name`, patient!.fullName, {
            httpOnly: false, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`patient_${slug}_id`, patientId, {
            httpOnly: false, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`hospital_${slug}`, hospital.id, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
