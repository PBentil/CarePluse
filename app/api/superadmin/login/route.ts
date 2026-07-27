import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json()

        const admin = await prisma.superAdmin.findUnique({ where: { email } })
        if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

        const response = NextResponse.json({ message: "Login successful", admin: { id: admin.id, email: admin.email } })

        response.cookies.set("superadmin", admin.id, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
