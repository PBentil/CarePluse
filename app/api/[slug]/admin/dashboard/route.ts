import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const hospitalId = staff.hospitalId

        const [patients, doctors, appointments, labTests] = await Promise.all([
            prisma.patient.count({ where: { hospitalId } }),
            prisma.doctor.count({ where: { hospitalId } }),
            prisma.appointment.count({ where: { hospitalId } }),
            prisma.labTest.count({ where: { hospitalId } }),
        ])

        const hospital = await prisma.hospital.findUnique({
            where:  { id: hospitalId },
            select: { name: true, plan: true, subscriptionStatus: true, subscriptionExpiry: true },
        })

        return NextResponse.json({ stats: { patients, doctors, appointments, labTests }, hospital })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
