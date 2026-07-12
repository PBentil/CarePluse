import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { id }     = await params
        const { status } = await req.json()

        const hospital = await prisma.hospital.update({
            where: { id },
            data:  { subscriptionStatus: status },
        })

        return NextResponse.json(hospital)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
