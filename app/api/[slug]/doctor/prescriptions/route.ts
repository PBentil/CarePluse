import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const { searchParams } = req.nextUrl
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const skip  = (page - 1) * limit
        const [prescriptions, total] = await Promise.all([
            prisma.prescription.findMany({
                where: { doctorId: doctor.id, hospitalId: doctor.hospitalId },
                orderBy: { createdAt: "desc" }, skip, take: limit,
                include: { patient: { select: { fullName: true, email: true, phone: true } }, items: true },
            }),
            prisma.prescription.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId } }),
        ])
        return NextResponse.json({ prescriptions, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const { appointmentId, patientId, diagnosis, notes, items } = await req.json()
        if (!appointmentId || !patientId || !items?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const prescription = await prisma.prescription.create({
            data: {
                hospitalId: doctor.hospitalId, appointmentId, patientId, doctorId: doctor.id,
                diagnosis: diagnosis ?? null, notes: notes ?? null,
                items: { create: items.map((item: any) => ({
                    drugName: item.drugName, dosage: item.dosage, frequency: item.frequency,
                    duration: item.duration, price: item.price, notes: item.notes ?? null,
                }))},
            },
            include: { patient: { select: { fullName: true, email: true, phone: true } }, items: true },
        })
        return NextResponse.json(prescription, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
