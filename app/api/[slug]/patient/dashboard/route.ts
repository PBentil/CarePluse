import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const today = new Date()

        const [total, pending, confirmed, upcoming] = await Promise.all([
            prisma.appointment.count({ where: { patientId: patient.id, hospitalId: patient.hospitalId } }),
            prisma.appointment.count({ where: { patientId: patient.id, hospitalId: patient.hospitalId, status: "pending" } }),
            prisma.appointment.count({ where: { patientId: patient.id, hospitalId: patient.hospitalId, status: "confirmed" } }),
            prisma.appointment.findMany({
                where: { patientId: patient.id, hospitalId: patient.hospitalId, status: { in: ["pending", "confirmed"] }, date: { gte: today } },
                orderBy: { date: "asc" }, take: 5,
                include: { doctor: { select: { name: true, specialty: true } } },
            }),
        ])

        return NextResponse.json({ total, pending, confirmed, upcoming })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
