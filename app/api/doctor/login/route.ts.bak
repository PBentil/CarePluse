import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
    const { email, password } = await req.json()

    const doctor = await prisma.doctor.findUnique({
        where: { email },
    })

    if (!doctor) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, doctor.password)

    if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({
        message: "Login successful",
        doctor: { id: doctor.id, name: doctor.name, email: doctor.email }
    })

    response.cookies.set("doctor", doctor.id, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "lax",
        path:     "/",
        maxAge:   60 * 60 * 24 * 7,
    })

    return response
}