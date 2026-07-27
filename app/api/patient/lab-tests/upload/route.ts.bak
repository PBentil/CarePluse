import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const formData   = await req.formData()
        const file       = formData.get("file") as File | null
        const testName   = formData.get("testName") as string | null
        const labTestId  = formData.get("labTestId") as string | null
        const resultNotes = formData.get("resultNotes") as string | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const buffer   = Buffer.from(await file.arrayBuffer())
        const filename = `lab-results/${patientId}/${Date.now()}-${file.name.replace(/\s/g, "-")}`

        const { url } = await uploadFile(buffer, filename, "carepulse/lab-results")

        if (labTestId) {
            await prisma.labTest.update({
                where: { id: labTestId },
                data: {
                    resultUrl:   url,
                    resultNotes: resultNotes ?? null,
                    status:      "completed",
                    completedAt: new Date(),
                },
            })
        } else {
            if (!testName) {
                return NextResponse.json({ error: "Test name is required" }, { status: 400 })
            }

            await prisma.labTest.create({
                data: {
                    patientId,
                    doctorId:      (await prisma.patient.findUnique({
                        where:  { id: patientId },
                        select: { primaryPhysicianId: true },
                    }))?.primaryPhysicianId ?? "",
                    appointmentId: (await prisma.appointment.findFirst({
                        where:   { patientId },
                        orderBy: { createdAt: "desc" },
                        select:  { id: true },
                    }))?.id ?? "",
                    testName,
                    resultUrl:   url,
                    resultNotes: resultNotes ?? null,
                    status:      "completed",
                    completedAt: new Date(),
                },
            })
        }

        return NextResponse.json({ url })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
