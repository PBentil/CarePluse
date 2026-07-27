import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const hospitalId = staff.hospitalId

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        // Appointments per month
        const appointments = await prisma.appointment.findMany({
            where:   { hospitalId, createdAt: { gte: sixMonthsAgo } },
            select:  { createdAt: true, status: true },
            orderBy: { createdAt: "asc" },
        })

        // Patients per month
        const patients = await prisma.patient.findMany({
            where:   { hospitalId, createdAt: { gte: sixMonthsAgo } },
            select:  { createdAt: true },
            orderBy: { createdAt: "asc" },
        })

        // Group by month
        const byMonth: Record<string, { appointments: number; patients: number; completed: number }> = {}

        const getMonthKey = (date: Date) =>
            new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })

        appointments.forEach(a => {
            const key = getMonthKey(a.createdAt)
            if (!byMonth[key]) byMonth[key] = { appointments: 0, patients: 0, completed: 0 }
            byMonth[key].appointments++
            if (a.status === "completed") byMonth[key].completed++
        })

        patients.forEach(p => {
            const key = getMonthKey(p.createdAt)
            if (!byMonth[key]) byMonth[key] = { appointments: 0, patients: 0, completed: 0 }
            byMonth[key].patients++
        })

        // Appointment status breakdown
        const statusBreakdown = await prisma.appointment.groupBy({
            by:    ["status"],
            where: { hospitalId },
            _count: { id: true },
        })

        // Top doctors by appointments
        const topDoctors = await prisma.doctor.findMany({
            where: { hospitalId },
            include: { _count: { select: { appointments: true } } },
            orderBy: { appointments: { _count: "desc" } },
            take: 5,
        })

        return NextResponse.json({
            byMonth:        Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
            statusBreakdown,
            topDoctors:     topDoctors.map(d => ({ name: d.name, specialty: d.specialty, appointments: d._count.appointments })),
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
