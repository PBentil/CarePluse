import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const labTests = await prisma.labTest.findMany({
            where: { patientId: patient.id, hospitalId: patient.hospitalId },
            orderBy: { orderedAt: "desc" },
            include: { doctor: { select: { name: true, specialty: true } } },
        })

        return NextResponse.json({ labTests })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
