import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"
import { createVideoRoom } from "@/lib/daily"
import { sendEmail, sendSMS } from "@/lib/notification"
import { sendPushToUsers } from "@/lib/push"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const { slug, id } = await params
        const doctor       = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const { action, rejectionReason, rescheduledDate, notes, diagnosis, requiresLabTest } = body

        const existing = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, email: true } },
            },
        })

        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
        if (existing.doctorId !== doctor.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        let updateData: any = {}

        if (action === "confirm") {
            const { url: videoRoomUrl, name: videoRoomName } = await createVideoRoom(id)
            updateData = { status: "confirmed", videoRoomUrl, videoRoomName }
            const formatted = new Date(existing.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
            const patientSubs = await prisma.pushSubscription.findMany({
                where: { userId: existing.patientId, userType: "patient" },
            })
            await Promise.all([
                sendSMS(existing.patient.phone, `Hi ${existing.patient.fullName}, your appointment with Dr. ${existing.doctor.name} on ${formatted} is confirmed. Join: ${videoRoomUrl}`),
                sendEmail({ to: existing.patient.email, subject: "Appointment Confirmed", html: `<div style="font-family:sans-serif;padding:32px;"><h2>Appointment Confirmed</h2><p>Hi ${existing.patient.fullName},</p><p>Your appointment with Dr. ${existing.doctor.name} on ${formatted} is confirmed.</p><a href="${videoRoomUrl}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#18181b;color:#fff;border-radius:10px;text-decoration:none;">Join Video Call</a></div>` }),
                sendPushToUsers(patientSubs, { title: "Appointment Confirmed ✓", body: `Your appointment with Dr. ${existing.doctor.name} on ${formatted} is confirmed.`, url: `/${slug}/patient/appointments` }),
            ])
        } else if (action === "reject") {
            if (!rejectionReason) return NextResponse.json({ error: "Rejection reason required" }, { status: 400 })
            updateData = { status: "rejected", rejectionReason }
            await Promise.all([
                sendSMS(existing.patient.phone, `Hi ${existing.patient.fullName}, your appointment with Dr. ${existing.doctor.name} was rejected. Reason: ${rejectionReason}`),
                sendEmail({ to: existing.patient.email, subject: "Appointment Rejected", html: `<div style="font-family:sans-serif;padding:32px;"><h2>Appointment Rejected</h2><p>Reason: ${rejectionReason}</p></div>` }),
            ])
        } else if (action === "reschedule") {
            if (!rescheduledDate) return NextResponse.json({ error: "New date required" }, { status: 400 })
            updateData = { status: "rescheduled", rescheduledDate: new Date(rescheduledDate) }
            const newDate = new Date(rescheduledDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
            await Promise.all([
                sendSMS(existing.patient.phone, `Hi ${existing.patient.fullName}, your appointment has been rescheduled to ${newDate}`),
                sendEmail({ to: existing.patient.email, subject: "Appointment Rescheduled", html: `<div style="font-family:sans-serif;padding:32px;"><h2>Appointment Rescheduled</h2><p>New date: ${newDate}</p></div>` }),
            ])
        } else if (action === "notes") {
            updateData = { notes: notes ?? null, diagnosis: diagnosis ?? null, requiresLabTest: requiresLabTest ?? false }
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const updated = await prisma.appointment.update({
            where: { id }, data: updateData,
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true, email: true } },
            },
        })

        return NextResponse.json(updated)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
