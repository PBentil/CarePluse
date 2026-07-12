import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        // Hospitals per month (last 6 months)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const hospitals = await prisma.hospital.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true, plan: true },
            orderBy: { createdAt: "asc" },
        })

        // Group by month
        const byMonth: Record<string, { hospitals: number; revenue: number }> = {}
        hospitals.forEach(h => {
            const key = new Date(h.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
            if (!byMonth[key]) byMonth[key] = { hospitals: 0, revenue: 0 }
            byMonth[key].hospitals++
        })

        // Revenue by plan
        const planRevenue = await prisma.subscription.groupBy({
            by: ["plan"],
            where: { status: "active" },
            _sum: { amount: true },
            _count: { id: true },
        })

        // Top hospitals by appointments
        const topHospitals = await prisma.hospital.findMany({
            take: 5,
            include: {
                _count: { select: { appointments: true, patients: true } },
            },
            orderBy: { appointments: { _count: "desc" } },
        })

        return NextResponse.json({
            byMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
            planRevenue,
            topHospitals: topHospitals.map(h => ({
                name:         h.name,
                slug:         h.slug,
                appointments: h._count.appointments,
                patients:     h._count.patients,
            })),
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
