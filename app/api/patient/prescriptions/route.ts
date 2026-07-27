import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const [prescriptions, total] = await Promise.all([
            prisma.prescription.findMany({
                where:   { patientId },
                orderBy: { createdAt: "desc" },
                include: {
                    doctor: { select: { name: true, specialty: true } },
                    items:  true,
                },
            }),
            prisma.prescription.count({ where: { patientId } }),
        ])

        return NextResponse.json({ prescriptions, total })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
