import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
    appointmentConfirmedWithVideoTemplate,
    appointmentRejectedTemplate,
    appointmentRescheduledTemplate,
    sendEmail,
    sendSMS,
} from "@/lib/notification"
import { createVideoRoom } from "@/lib/daily"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const doctorId = req.cookies.get("doctor")?.value
        if (!doctorId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { action, rejectionReason, rescheduledDate } = body

        const existing = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, email: true } },
            },
        })

        if (!existing) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
        }

        if (existing.doctorId !== doctorId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        let updateData: any = {}

        if (action === "confirm") {
            const { url: videoRoomUrl, name: videoRoomName } = await createVideoRoom(id)

            updateData = { status: "confirmed", videoRoomUrl, videoRoomName }

            const formatted = new Date(existing.date).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })

            const tpl = appointmentConfirmedWithVideoTemplate({
                patientName: existing.patient.fullName,
                doctorName:  existing.doctor.name,
                date:        formatted,
                videoUrl:    videoRoomUrl,
            })

            await Promise.all([
                sendSMS(existing.patient.phone, tpl.sms),
                sendEmail({ to: existing.patient.email, ...tpl.email }),
            ])
        }

        else if (action === "reject") {
            if (!rejectionReason) {
                return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
            }
            updateData = { status: "rejected", rejectionReason }

            const tpl = appointmentRejectedTemplate({
                patientName: existing.patient.fullName,
                doctorName:  existing.doctor.name,
                reason:      rejectionReason,
            })

            await Promise.all([
                sendSMS(existing.patient.phone, tpl.sms),
                sendEmail({ to: existing.patient.email, ...tpl.email }),
            ])
        }

        else if (action === "reschedule") {
            if (!rescheduledDate) {
                return NextResponse.json({ error: "New date is required" }, { status: 400 })
            }
            updateData = { status: "rescheduled", rescheduledDate: new Date(rescheduledDate) }

            const oldDate = new Date(existing.date).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
            })
            const newDate = new Date(rescheduledDate).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })

            const tpl = appointmentRescheduledTemplate({
                patientName: existing.patient.fullName,
                doctorName:  existing.doctor.name,
                oldDate,
                newDate,
            })

            await Promise.all([
                sendSMS(existing.patient.phone, tpl.sms),
                sendEmail({ to: existing.patient.email, ...tpl.email }),
            ])
        }


        else if (action === "notes") {
            if (!body.notes) {
                return NextResponse.json({ error: "Notes are required" }, { status: 400 })
            }
            updateData = {
                notes:           body.notes,
                diagnosis:       body.diagnosis ?? null,
                requiresLabTest: body.requiresLabTest ?? false,
            }
        }
        else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true, email: true } },
            },
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}