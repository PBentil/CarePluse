import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const { email, password } = await req.json()

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        if (hospital.subscriptionStatus === "expired") {
            return NextResponse.json({ error: "Subscription expired. Please contact your administrator." }, { status: 403 })
        }

        const doctor = await prisma.doctor.findFirst({
            where: { email, hospitalId: hospital.id, isActive: true },
        })

        if (!doctor) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

        const isMatch = await bcrypt.compare(password, doctor.password)
        if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

        const response = NextResponse.json({
            message:  "Login successful",
            doctor:   { id: doctor.id, name: doctor.name, email: doctor.email, specialty: doctor.specialty },
            hospital: { id: hospital.id, name: hospital.name, slug: hospital.slug },
        })

        response.cookies.set(`doctor_${slug}`, doctor.id, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`doctor_${slug}_name`, doctor.name, {
            httpOnly: false, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`doctor_${slug}_id`, doctor.id, {
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
