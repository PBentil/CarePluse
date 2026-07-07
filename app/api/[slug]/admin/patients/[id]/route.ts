import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const patient = await prisma.patient.findFirst({
            where: { id, hospitalId: staff.hospitalId },
        })

        if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 })
        return NextResponse.json(patient)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        await prisma.patient.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
