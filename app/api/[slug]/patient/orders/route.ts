import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const orders = await prisma.order.findMany({
            where: { patientId: patient.id, hospitalId: patient.hospitalId },
            orderBy: { createdAt: "desc" },
            include: { prescription: { include: { items: true, doctor: { select: { name: true } } } } },
        })

        return NextResponse.json({ orders })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
