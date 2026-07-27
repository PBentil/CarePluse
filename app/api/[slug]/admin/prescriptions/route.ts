import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const status = searchParams.get("status") ?? ""
        const skip   = (page - 1) * limit

        const where: any = { hospitalId: staff.hospitalId }
        if (status) where.status = status

        const [prescriptions, total] = await Promise.all([
            prisma.prescription.findMany({
                where, orderBy: { createdAt: "desc" }, skip, take: limit,
                include: {
                    patient: { select: { fullName: true, email: true, phone: true } },
                    doctor:  { select: { name: true, specialty: true } },
                    items:   true,
                },
            }),
            prisma.prescription.count({ where }),
        ])

        return NextResponse.json({ prescriptions, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
