import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id, hospitalId: patient.hospitalId },
            orderBy: { createdAt: "desc" },
            include: { doctor: { select: { name: true, specialty: true } }, items: true },
        })

        return NextResponse.json({ prescriptions })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
