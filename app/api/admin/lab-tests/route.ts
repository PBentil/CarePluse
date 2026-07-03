import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where = status ? { status } : {}

        const [labTests, total] = await Promise.all([
            prisma.labTest.findMany({
                where,
                orderBy: { orderedAt: "desc" },
                skip,
                take: limit,
                include: {
                    patient:     { select: { fullName: true, email: true, phone: true } },
                    doctor:      { select: { name: true, specialty: true } },
                    appointment: { select: { date: true, reason: true } },
                },
            }),
            prisma.labTest.count({ where }),
        ])

        return NextResponse.json({ labTests, total })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
