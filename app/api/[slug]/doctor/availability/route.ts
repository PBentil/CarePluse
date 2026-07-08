import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const availability = await prisma.availability.findMany({ where: { doctorId: doctor.id }, orderBy: { dayOfWeek: "asc" } })
        return NextResponse.json({ availability })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const { dayOfWeek, startTime, endTime, slotDurationMins } = await req.json()
        const existing = await prisma.availability.findFirst({ where: { doctorId: doctor.id, dayOfWeek } })
        if (existing) {
            const updated = await prisma.availability.update({ where: { id: existing.id }, data: { startTime, endTime, slotDurationMins: slotDurationMins ?? 30, isActive: true } })
            return NextResponse.json(updated)
        }
        const availability = await prisma.availability.create({
            data: { doctorId: doctor.id, hospitalId: doctor.hospitalId, dayOfWeek, startTime, endTime, slotDurationMins: slotDurationMins ?? 30 },
        })
        return NextResponse.json(availability, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const { dayOfWeek } = await req.json()
        await prisma.availability.updateMany({ where: { doctorId: doctor.id, dayOfWeek }, data: { isActive: false } })
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
