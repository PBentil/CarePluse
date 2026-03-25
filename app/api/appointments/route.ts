import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const patient = await prisma.patient.findUnique({
            where: { id: body.patientId },
            select: {
                id: true, fullName: true, email: true, phone: true,
                consentTreatment: true, consentPrivacy: true, consentTerms: true,
                dateOfBirth: true, gender: true,
            },
        })

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 })
        }

        const intakeComplete =
            patient.consentTreatment &&
            patient.consentPrivacy &&
            patient.consentTerms &&
            patient.dateOfBirth &&
            patient.gender

        if (!intakeComplete) {
            return NextResponse.json(
                { error: "Please complete your intake form before booking an appointment." },
                { status: 403 }
            )
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId: body.patientId,
                doctorId:  body.doctorId,
                date:      new Date(body.date),
                reason:    body.reason,
                notes:     body.notes || null,
                status:    "pending",
            },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
            },
        })

        return NextResponse.json(appointment, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const patientId = searchParams.get("patientId")

        const appointments = await prisma.appointment.findMany({
            where: patientId ? { patientId } : {},
            orderBy: { date: "desc" },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true, email: true } },
            },
        })

        return NextResponse.json(appointments)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}