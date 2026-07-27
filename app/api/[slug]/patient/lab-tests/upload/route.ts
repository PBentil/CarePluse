import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"
import { uploadFile } from "@/lib/cloudinary"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const patient  = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const formData    = await req.formData()
        const file        = formData.get("file") as File | null
        const testName    = formData.get("testName") as string | null
        const labTestId   = formData.get("labTestId") as string | null
        const resultNotes = formData.get("resultNotes") as string | null

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

        const buffer   = Buffer.from(await file.arrayBuffer())
        const filename = `lab-results/${patient.id}/${Date.now()}-${file.name.replace(/\s/g, "-")}`
        const { url }  = await uploadFile(buffer, filename, "carepulse/lab-results")

        if (labTestId) {
            await prisma.labTest.update({
                where: { id: labTestId },
                data: { resultUrl: url, resultNotes: resultNotes ?? null, status: "completed", completedAt: new Date() },
            })
        } else {
            if (!testName) return NextResponse.json({ error: "Test name required" }, { status: 400 })
            const latestAppt = await prisma.appointment.findFirst({
                where: { patientId: patient.id }, orderBy: { createdAt: "desc" }, select: { id: true, doctorId: true },
            })
            await prisma.labTest.create({
                data: {
                    hospitalId:   patient.hospitalId,
                    patientId:    patient.id,
                    doctorId:     latestAppt?.doctorId ?? "",
                    appointmentId: latestAppt?.id ?? "",
                    testName, resultUrl: url, resultNotes: resultNotes ?? null,
                    status: "completed", completedAt: new Date(),
                },
            })
        }

        return NextResponse.json({ url })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
