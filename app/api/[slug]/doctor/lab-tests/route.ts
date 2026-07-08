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
        const [labTests, total] = await Promise.all([
            prisma.labTest.findMany({
                where: { doctorId: doctor.id, hospitalId: doctor.hospitalId },
                orderBy: { orderedAt: "desc" }, skip, take: limit,
                include: { patient: { select: { fullName: true, email: true, phone: true } } },
            }),
            prisma.labTest.count({ where: { doctorId: doctor.id, hospitalId: doctor.hospitalId } }),
        ])
        return NextResponse.json({ labTests, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const { appointmentId, patientId, testNames } = await req.json()
        if (!appointmentId || !patientId || !testNames?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const result = await prisma.labTest.createMany({
            data: testNames.map((testName: string) => ({
                hospitalId: doctor.hospitalId, appointmentId, patientId, doctorId: doctor.id, testName, status: "ordered",
            })),
        })
        return NextResponse.json({ count: result.count }, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
