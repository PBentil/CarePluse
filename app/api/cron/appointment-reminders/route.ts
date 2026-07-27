import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS, sendEmail } from "@/lib/notification"

export async function GET(req: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = req.headers.get("authorization")
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const now       = new Date()
        const in24hrs   = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const in25hrs   = new Date(now.getTime() + 25 * 60 * 60 * 1000)

        // Find confirmed appointments in the next 24 hours
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "confirmed",
                date: {
                    gte: in24hrs,
                    lte: in25hrs,
                },
            },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
            },
        })

        let sent = 0

        for (const appt of appointments) {
            const formatted = new Date(appt.date).toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long",
                hour: "2-digit", minute: "2-digit",
            })

            await Promise.all([
                sendSMS(
                    appt.patient.phone,
                    `Reminder: You have an appointment with Dr. ${appt.doctor.name} tomorrow at ${formatted}. Join via your CarePulse patient portal.`
                ),
                sendEmail({
                    to:      appt.patient.email,
                    subject: `Appointment Reminder — Tomorrow with Dr. ${appt.doctor.name}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                            <h2 style="color:#18181b;">Appointment Reminder</h2>
                            <p style="color:#71717a;">Hi ${appt.patient.fullName},</p>
                            <p style="color:#71717a;">This is a reminder that you have an appointment tomorrow:</p>
                            <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:20px 0;">
                                <p style="margin:4px 0;color:#18181b;"><strong>Doctor:</strong> Dr. ${appt.doctor.name}</p>
                                <p style="margin:4px 0;color:#18181b;"><strong>Specialty:</strong> ${appt.doctor.specialty ?? ""}</p>
                                <p style="margin:4px 0;color:#18181b;"><strong>Date & Time:</strong> ${formatted}</p>
                            </div>
                            <p style="color:#71717a;font-size:13px;">Log in to your patient portal to join the video call.</p>
                            <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse — Your health, our priority.</p>
                        </div>
                    `,
                }),
            ])

            sent++
        }

        return NextResponse.json({ message: `Sent ${sent} reminders`, count: sent })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
