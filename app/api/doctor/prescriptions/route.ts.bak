import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const doctorId = req.cookies.get("doctor")?.value
        if (!doctorId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const skip  = (page - 1) * limit

        const [prescriptions, total] = await Promise.all([
            prisma.prescription.findMany({
                where:   { doctorId },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    patient: { select: { fullName: true, email: true, phone: true } },
                    items:   true,
                },
            }),
            prisma.prescription.count({ where: { doctorId } }),
        ])

        return NextResponse.json({ prescriptions, total })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const doctorId = req.cookies.get("doctor")?.value
        if (!doctorId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const { appointmentId, patientId, diagnosis, notes, items } = body

        if (!appointmentId || !patientId || !items?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const prescription = await prisma.prescription.create({
            data: {
                appointmentId,
                patientId,
                doctorId,
                diagnosis: diagnosis ?? null,
                notes:     notes     ?? null,
                items: {
                    create: items.map((item: {
                        drugName:  string
                        dosage:    string
                        frequency: string
                        duration:  string
                        price:     number
                        notes?:    string
                    }) => ({
                        drugName:  item.drugName,
                        dosage:    item.dosage,
                        frequency: item.frequency,
                        duration:  item.duration,
                        price:     item.price,
                        notes:     item.notes ?? null,
                    })),
                },
            },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                items:   true,
            },
        })

        return NextResponse.json(prescription, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
