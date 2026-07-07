import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"
import bcrypt from "bcrypt"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const skip  = (page - 1) * limit

        const [members, total] = await Promise.all([
            prisma.staff.findMany({
                where: { hospitalId: staff.hospitalId },
                orderBy: { createdAt: "desc" },
                skip, take: limit,
                select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
            }),
            prisma.staff.count({ where: { hospitalId: staff.hospitalId } }),
        ])

        return NextResponse.json({ staff: members, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body           = await req.json()
        const hashedPassword = await bcrypt.hash(body.password || Math.random().toString(36).slice(2), 10)

        const member = await prisma.staff.create({
            data: {
                hospitalId: staff.hospitalId,
                name:       body.name,
                email:      body.email,
                password:   hashedPassword,
                role:       body.role,
            },
        })

        const { password: _, ...safe } = member
        return NextResponse.json(safe, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
