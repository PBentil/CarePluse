import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { patientId, doctorId, date, reason, notes } = body

        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { hospitalId: true },
        })

        if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

        const appointment = await prisma.appointment.create({
            data: {
                hospitalId: patient.hospitalId,
                patientId,
                doctorId,
                date:   new Date(date),
                reason,
                notes:  notes ?? null,
                status: "pending",
            },
        })

        return NextResponse.json(appointment, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
