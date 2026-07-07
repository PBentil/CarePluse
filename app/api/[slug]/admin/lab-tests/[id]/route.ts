import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"
import { sendEmail, sendSMS } from "@/lib/notification"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { status, resultNotes, resultUrl } = await req.json()

        const existing = await prisma.labTest.findUnique({
            where: { id },
            include: { patient: { select: { fullName: true, email: true, phone: true } } },
        })
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const updated = await prisma.labTest.update({
            where: { id },
            data: {
                status,
                resultNotes: resultNotes ?? null,
                resultUrl:   resultUrl   ?? null,
                completedAt: status === "completed" ? new Date() : null,
            },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
            },
        })

        if (status === "completed") {
            await Promise.all([
                sendSMS(existing.patient.phone, `Hi ${existing.patient.fullName}, your lab results for ${existing.testName} are ready. Log in to view them.`),
                sendEmail({
                    to:      existing.patient.email,
                    subject: "Lab Results Ready",
                    html:    `<div style="font-family:sans-serif;padding:32px;"><h2>Your lab results are ready</h2><p>Hi ${existing.patient.fullName}, your results for <strong>${existing.testName}</strong> are now available.</p></div>`,
                }),
            ])
        }

        return NextResponse.json(updated)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
