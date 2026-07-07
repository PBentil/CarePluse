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
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where: any = { hospitalId: staff.hospitalId }
        if (search) {
            where.OR = [
                { name:      { contains: search, mode: "insensitive" } },
                { specialty: { contains: search, mode: "insensitive" } },
                { email:     { contains: search, mode: "insensitive" } },
            ]
        }

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where, orderBy: { createdAt: "desc" }, skip, take: limit,
                select: { id: true, name: true, specialty: true, email: true, isActive: true, createdAt: true },
            }),
            prisma.doctor.count({ where }),
        ])

        return NextResponse.json({ doctors, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        if (!body.password) return NextResponse.json({ error: "Password is required" }, { status: 400 })

        const hashedPassword = await bcrypt.hash(body.password, 10)
        const doctor = await prisma.doctor.create({
            data: {
                hospitalId: staff.hospitalId,
                name:       body.name,
                specialty:  body.specialty ?? null,
                email:      body.email,
                password:   hashedPassword,
            },
        })

        const { password: _, ...safe } = doctor
        return NextResponse.json(safe, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
