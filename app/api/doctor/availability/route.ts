import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const doctor = await getDoctorFromRequest(req)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const availability = await prisma.availability.findMany({
            where:   { doctorId: doctor.id },
            orderBy: { dayOfWeek: "asc" },
        })

        return NextResponse.json({ availability })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const doctor = await getDoctorFromRequest(req)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const { dayOfWeek, startTime, endTime, slotDurationMins } = body

        if (dayOfWeek === undefined || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existing = await prisma.availability.findFirst({
            where: { doctorId: doctor.id, dayOfWeek },
        })

        if (existing) {
            const updated = await prisma.availability.update({
                where: { id: existing.id },
                data: {
                    startTime,
                    endTime,
                    slotDurationMins: slotDurationMins ?? 30,
                    isActive: true,
                },
            })
            return NextResponse.json(updated)
        }

        const availability = await prisma.availability.create({
            data: {
                doctorId: doctor.id,
                dayOfWeek,
                startTime,
                endTime,
                slotDurationMins: slotDurationMins ?? 30,
            },
        })

        return NextResponse.json(availability, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const doctor = await getDoctorFromRequest(req)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { dayOfWeek } = await req.json()

        await prisma.availability.updateMany({
            where: { doctorId: doctor.id, dayOfWeek },
            data:  { isActive: false },
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
