import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = {}

        if (status) where.status = status

        if (search) {
            where.OR = [
                { patient: { fullName: { contains: search, mode: "insensitive" } } },
                { doctor:  { name:     { contains: search, mode: "insensitive" } } },
                { reason:               { contains: search, mode: "insensitive" } },
            ]
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    patient: { select: { fullName: true, email: true, phone: true } },
                    doctor:  { select: { name: true, specialty: true, email: true } },
                },
            }),
            prisma.appointment.count({ where }),
        ])

        return NextResponse.json({ appointments, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}