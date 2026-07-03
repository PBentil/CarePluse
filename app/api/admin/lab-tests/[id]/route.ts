import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status, resultNotes, resultUrl } = body

        const existing = await prisma.labTest.findUnique({
            where: { id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true } },
            },
        })

        if (!existing) return NextResponse.json({ error: "Lab test not found" }, { status: 404 })

        const updated = await prisma.labTest.update({
            where: { id },
            data: {
                status,
                resultNotes: resultNotes ?? null,
                resultUrl:   resultUrl   ?? null,
                completedAt: status === "completed" ? new Date() : null,
            },
            include: {
                patient:     { select: { fullName: true, email: true, phone: true } },
                doctor:      { select: { name: true, specialty: true } },
                appointment: { select: { date: true, reason: true } },
            },
        })

        if (status === "completed") {
            const sms   = `Hi ${existing.patient.fullName}, your lab results for ${existing.testName} are ready. Log in to CarePulse to view them. – CarePulse`
            const email = {
                to:      existing.patient.email,
                subject: "Lab Results Ready – CarePulse",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                        <h2 style="color:#18181b;font-size:18px;">Your lab results are ready</h2>
                        <p style="color:#71717a;">Hi <strong>${existing.patient.fullName}</strong>,</p>
                        <p style="color:#71717a;">Your results for <strong>${existing.testName}</strong> are now available.</p>
                        <p style="color:#71717a;">Log in to your CarePulse patient portal to view them.</p>
                        <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
                    </div>
                `,
            }
            await Promise.all([sendSMS(existing.patient.phone, sms), sendEmail(email)])
        }

        return NextResponse.json(updated)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
