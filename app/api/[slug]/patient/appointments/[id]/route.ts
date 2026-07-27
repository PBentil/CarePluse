import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const { slug, id } = await params
        const patient      = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const appointment = await prisma.appointment.findFirst({
            where: { id, patientId: patient.id },
            include: {
                doctor: { select: { name: true, email: true } },
                patient: { select: { fullName: true, email: true, phone: true } },
            },
        })

        if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 })

        if (["completed", "rejected", "cancelled"].includes(appointment.status)) {
            return NextResponse.json({ error: "Cannot cancel this appointment" }, { status: 400 })
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data:  { status: "cancelled" },
        })

        await Promise.all([
            sendSMS(appointment.patient.phone, `Hi ${appointment.patient.fullName}, your appointment with Dr. ${appointment.doctor.name} has been cancelled.`),
            sendEmail({
                to:      appointment.doctor.email,
                subject: "Appointment Cancelled",
                html:    `<div style="font-family:sans-serif;padding:32px;"><h2>Appointment Cancelled</h2><p>Hi Dr. ${appointment.doctor.name},</p><p>${appointment.patient.fullName} has cancelled their appointment scheduled for ${new Date(appointment.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.</p></div>`,
            }),
        ])

        return NextResponse.json(updated)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
