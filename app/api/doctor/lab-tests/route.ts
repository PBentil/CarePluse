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

        const [labTests, total] = await Promise.all([
            prisma.labTest.findMany({
                where:   { doctorId },
                orderBy: { orderedAt: "desc" },
                skip,
                take: limit,
                include: {
                    patient:     { select: { fullName: true, email: true, phone: true } },
                    appointment: { select: { date: true, reason: true } },
                },
            }),
            prisma.labTest.count({ where: { doctorId } }),
        ])

        return NextResponse.json({ labTests, total })
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
        const { appointmentId, patientId, testNames } = body

        if (!appointmentId || !patientId || !testNames?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const labTests = await prisma.labTest.createMany({
            data: testNames.map((testName: string) => ({
                appointmentId,
                patientId,
                doctorId,
                testName,
                status: "ordered",
            })),
        })

        return NextResponse.json({ count: labTests.count }, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
