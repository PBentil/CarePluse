import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = { patientId: patient.id, hospitalId: patient.hospitalId }
        if (status) where.status = status

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where, orderBy: { date: "desc" }, skip, take: limit,
                include: { doctor: { select: { name: true, specialty: true } } },
            }),
            prisma.appointment.count({ where }),
        ])

        return NextResponse.json({ appointments, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const { doctorId, date, reason, notes } = body

        if (!doctorId || !date || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const appointment = await prisma.appointment.create({
            data: {
                hospitalId: patient.hospitalId,
                patientId:  patient.id,
                doctorId,
                date:       new Date(date),
                reason,
                notes:      notes ?? null,
            },
            include: { doctor: { select: { name: true, specialty: true } } },
        })

        return NextResponse.json(appointment, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
