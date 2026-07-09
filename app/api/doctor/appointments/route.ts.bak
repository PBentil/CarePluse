import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const doctorId = req.cookies.get("doctor")?.value

        if (!doctorId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = { doctorId }

        if (status) where.status = status

        if (search) {
            where.OR = [
                { patient: { fullName: { contains: search, mode: "insensitive" } } },
                { reason:              { contains: search, mode: "insensitive" } },
            ]
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                orderBy: { date: "asc" },
                skip,
                take: limit,
                include: {
                    patient: { select: { fullName: true, email: true, phone: true } },
                },
            }),
            prisma.appointment.count({ where }),
        ])

        return NextResponse.json({ appointments, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}