import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const [patients, appointments, doctors] = await Promise.all([
            prisma.patient.count(),
            prisma.appointment.count(),
            prisma.doctor.count(),
        ])

        return NextResponse.json({
            patients,
            appointments,
            doctors,
        })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}