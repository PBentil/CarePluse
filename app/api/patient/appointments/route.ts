import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = { patientId }
        if (status) where.status = status

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                orderBy: { date: "desc" },
                skip,
                take: limit,
                include: {
                    doctor: { select: { name: true, specialty: true } },
                },
            }),
            prisma.appointment.count({ where }),
        ])

        return NextResponse.json({ appointments, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
