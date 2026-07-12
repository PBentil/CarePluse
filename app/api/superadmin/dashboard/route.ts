import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const [
            totalHospitals,
            activeHospitals,
            trialHospitals,
            expiredHospitals,
            totalDoctors,
            totalPatients,
            totalAppointments,
            recentHospitals,
        ] = await Promise.all([
            prisma.hospital.count(),
            prisma.hospital.count({ where: { subscriptionStatus: "active" } }),
            prisma.hospital.count({ where: { subscriptionStatus: "trial" } }),
            prisma.hospital.count({ where: { subscriptionStatus: "expired" } }),
            prisma.doctor.count(),
            prisma.patient.count(),
            prisma.appointment.count(),
            prisma.hospital.findMany({
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, name: true, slug: true, plan: true, subscriptionStatus: true, createdAt: true },
            }),
        ])

        const subscriptions = await prisma.subscription.findMany({
            where: { status: "active" },
            select: { amount: true },
        })
        const totalRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0)

        return NextResponse.json({
            stats: { totalHospitals, activeHospitals, trialHospitals, expiredHospitals, totalDoctors, totalPatients, totalAppointments, totalRevenue },
            recentHospitals,
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
