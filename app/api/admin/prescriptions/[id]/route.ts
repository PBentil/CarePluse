import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id }     = await params
        const { status } = await req.json()

        const updated = await prisma.prescription.update({
            where: { id },
            data:  { status },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
                items:   true,
            },
        })

        return NextResponse.json(updated)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
