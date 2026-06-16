import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const doctorId = req.cookies.get("doctor")?.value

        if (!doctorId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const today      = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

        const [total, pending, confirmed, todayCount, upcoming] = await Promise.all([
            prisma.appointment.count({
                where: { doctorId },
            }),
            prisma.appointment.count({
                where: { doctorId, status: "pending" },
            }),
            prisma.appointment.count({
                where: { doctorId, status: "confirmed" },
            }),
            prisma.appointment.count({
                where: {
                    doctorId,
                    date: { gte: todayStart, lt: todayEnd },
                },
            }),
            prisma.appointment.findMany({
                where: {
                    doctorId,
                    status: { in: ["pending", "confirmed"] },
                    date:   { gte: today },
                },
                orderBy: { date: "asc" },
                take: 5,
                include: {
                    patient: { select: { fullName: true, phone: true } },
                },
            }),
        ])

        return NextResponse.json({ total, pending, confirmed, todayCount, upcoming })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}