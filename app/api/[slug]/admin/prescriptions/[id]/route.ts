import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { status } = await req.json()
        const updated = await prisma.prescription.update({
            where: { id }, data: { status },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
                items:   true,
            },
        })

        return NextResponse.json(updated)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
