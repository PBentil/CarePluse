import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const today      = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

        const [total, pending, confirmed, todayCount, upcoming] = await Promise.all([
            prisma.appointment.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId, status: "pending" } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId, status: "confirmed" } }),
            prisma.appointment.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId, date: { gte: todayStart, lt: todayEnd } } }),
            prisma.appointment.findMany({
                where: { doctorId: doctor.id, hospitalId: doctor.hospitalId, status: { in: ["pending", "confirmed"] }, date: { gte: today } },
                orderBy: { date: "asc" }, take: 5,
                include: { patient: { select: { fullName: true, phone: true } } },
            }),
        ])

        return NextResponse.json({
            total, pending, confirmed, todayCount, upcoming,
            doctor: { name: doctor.name, specialty: doctor.specialty },
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
