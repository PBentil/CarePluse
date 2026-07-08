import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = { doctorId: doctor.id, hospitalId: doctor.hospitalId }
        if (status) where.status = status

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where, orderBy: { date: "asc" }, skip, take: limit,
                include: { patient: { select: { fullName: true, email: true, phone: true } } },
            }),
            prisma.appointment.count({ where }),
        ])

        return NextResponse.json({ appointments, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
