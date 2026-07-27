import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const today = new Date()

        const [total, pending, confirmed, upcoming] = await Promise.all([
            prisma.appointment.count({ where: { patientId } }),
            prisma.appointment.count({ where: { patientId, status: "pending" } }),
            prisma.appointment.count({ where: { patientId, status: "confirmed" } }),
            prisma.appointment.findMany({
                where: {
                    patientId,
                    status: { in: ["pending", "confirmed"] },
                    date:   { gte: today },
                },
                orderBy: { date: "asc" },
                take: 5,
                include: {
                    doctor: { select: { name: true, specialty: true } },
                },
            }),
        ])

        return NextResponse.json({ total, pending, confirmed, upcoming })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
