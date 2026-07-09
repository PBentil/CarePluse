import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const plan  = searchParams.get("plan") ?? ""
        const skip  = (page - 1) * limit

        const where: any = {}
        if (plan) where.plan = plan

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip, take: limit,
                include: {
                    hospital: { select: { name: true, slug: true, email: true } },
                },
            }),
            prisma.subscription.count({ where }),
        ])

        const totalMRR = await prisma.subscription.aggregate({
            where: { status: "active" },
            _sum: { amount: true },
        })

        return NextResponse.json({ subscriptions, total, totalMRR: totalMRR._sum.amount ?? 0 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
