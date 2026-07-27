import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { searchParams } = req.nextUrl
        const doctorId = searchParams.get("doctorId")
        const date     = searchParams.get("date")
        if (!doctorId || !date) return NextResponse.json({ error: "doctorId and date required" }, { status: 400 })

        const dayOfWeek    = new Date(date).getDay()
        const availability = await prisma.availability.findFirst({ where: { doctorId, dayOfWeek, isActive: true } })
        if (!availability) return NextResponse.json({ slots: [] })

        const slots: string[] = []
        const [startH, startM] = availability.startTime.split(":").map(Number)
        const [endH, endM]     = availability.endTime.split(":").map(Number)
        const startMins = startH * 60 + startM
        const endMins   = endH   * 60 + endM

        for (let m = startMins; m + availability.slotDurationMins <= endMins; m += availability.slotDurationMins) {
            slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`)
        }

        const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
        const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)
        const booked   = await prisma.appointment.findMany({
            where: { doctorId, date: { gte: dayStart, lte: dayEnd }, status: { in: ["pending", "confirmed"] } },
            select: { date: true },
        })
        const bookedTimes = new Set(booked.map(a => {
            const d = new Date(a.date)
            return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        }))

        return NextResponse.json({ slots: slots.filter(s => !bookedTimes.has(s)), availability })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
