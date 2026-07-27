import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const [labTests, total] = await Promise.all([
            prisma.labTest.findMany({
                where:   { patientId },
                orderBy: { orderedAt: "desc" },
                include: {
                    doctor:      { select: { name: true, specialty: true } },
                    appointment: { select: { date: true, reason: true } },
                },
            }),
            prisma.labTest.count({ where: { patientId } }),
        ])

        return NextResponse.json({ labTests, total })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
