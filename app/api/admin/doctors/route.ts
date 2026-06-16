import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where = search ? {
            OR: [
                { name:      { contains: search, mode: "insensitive" as const } },
                { specialty: { contains: search, mode: "insensitive" as const } },
                { email:     { contains: search, mode: "insensitive" as const } },
            ],
        } : {}

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    specialty: true,
                    email: true,
                    createdAt: true,
                },
            }),
            prisma.doctor.count({ where }),
        ])

        return NextResponse.json({ doctors, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        if (!body.password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(body.password, 10)

        const doctor = await prisma.doctor.create({
            data: {
                name:      body.name,
                specialty: body.specialty,
                email:     body.email,
                password:  hashedPassword,
            },
        })

        const { password: _, ...doctorSafe } = doctor
        return NextResponse.json(doctorSafe, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}