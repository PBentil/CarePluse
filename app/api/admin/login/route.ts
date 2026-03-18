import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const { email, password } = await req.json()

    const admin = await prisma.admin.findUnique({
        where: { email },
    })

    if (!admin) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({ message: "Login successful" })

    response.cookies.set("admin", "true", {
        httpOnly: true,
        path: "/",
    })

    return response
}