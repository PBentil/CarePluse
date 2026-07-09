import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where: any = {}
        if (search) {
            where.OR = [
                { name:  { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { slug:  { contains: search, mode: "insensitive" } },
            ]
        }

        const [hospitals, total] = await Promise.all([
            prisma.hospital.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip, take: limit,
                include: {
                    _count: { select: { doctors: true, patients: true, appointments: true } },
                    subscription: { select: { amount: true, currentPeriodEnd: true } },
                },
            }),
            prisma.hospital.count({ where }),
        ])

        return NextResponse.json({ hospitals, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
