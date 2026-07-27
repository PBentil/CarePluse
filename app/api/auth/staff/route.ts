import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
    try {
        const { email, password, slug } = await req.json()

        if (!email || !password || !slug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) {
            return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
        }

        if (hospital.subscriptionStatus === "expired") {
            return NextResponse.json({ error: "Subscription expired. Please renew to continue." }, { status: 403 })
        }

        const staff = await prisma.staff.findFirst({
            where: { email, hospitalId: hospital.id, isActive: true },
        })

        if (!staff) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const isMatch = await bcrypt.compare(password, staff.password)
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const response = NextResponse.json({
            message: "Login successful",
            staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
            hospital: { id: hospital.id, name: hospital.name, slug: hospital.slug },
        })

        response.cookies.set(`staff_${slug}`, staff.id, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 7,
        })

        response.cookies.set(`staff_${slug}_role`, staff.role, {
            httpOnly: false,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 7,
        })

        response.cookies.set(`staff_${slug}_name`, staff.name, {
            httpOnly: false,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 7,
        })

        response.cookies.set(`hospital_status_${slug}`, hospital.subscriptionStatus, {
            httpOnly: false, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`hospital_status_${slug}`, hospital.subscriptionStatus, {
            httpOnly: false, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set(`hospital_${slug}`, hospital.id, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "lax",
            path:     "/",
            maxAge:   60 * 60 * 24 * 7,
        })

        return response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
