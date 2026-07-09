import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const doctorId = searchParams.get("doctorId")
        const date     = searchParams.get("date")

        if (!doctorId || !date) {
            return NextResponse.json({ error: "doctorId and date are required" }, { status: 400 })
        }

        const dateObj    = new Date(date)
        const dayOfWeek  = dateObj.getDay()

        const availability = await prisma.availability.findFirst({
            where: { doctorId, dayOfWeek, isActive: true },
        })

        if (!availability) {
            return NextResponse.json({ slots: [] })
        }

        // Generate time slots
        const slots: string[] = []
        const [startH, startM] = availability.startTime.split(":").map(Number)
        const [endH,   endM]   = availability.endTime.split(":").map(Number)
        const startMins = startH * 60 + startM
        const endMins   = endH   * 60 + endM
        const duration  = availability.slotDurationMins

        for (let m = startMins; m + duration <= endMins; m += duration) {
            const h   = Math.floor(m / 60)
            const min = m % 60
            slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`)
        }

        // Remove already booked slots
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const booked = await prisma.appointment.findMany({
            where: {
                doctorId,
                date:   { gte: dayStart, lte: dayEnd },
                status: { in: ["pending", "confirmed"] },
            },
            select: { date: true },
        })

        const bookedTimes = new Set(
            booked.map(a => {
                const d = new Date(a.date)
                return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
            })
        )

        const availableSlots = slots.filter(slot => !bookedTimes.has(slot))

        return NextResponse.json({ slots: availableSlots, availability })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
