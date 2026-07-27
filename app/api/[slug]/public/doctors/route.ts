import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const doctors = await prisma.doctor.findMany({
            where:   { hospitalId: hospital.id, isActive: true },
            select:  { id: true, name: true, specialty: true },
            orderBy: { name: "asc" },
        })

        return NextResponse.json({ doctors })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
