import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadFile } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
    try {
        const formData  = await req.formData()
        const file      = formData.get("file") as File | null
        const patientId = formData.get("patientId") as string | null

        if (!file || !patientId) {
            return NextResponse.json({ error: "File and patient ID are required" }, { status: 400 })
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 })
        }

        const buffer   = Buffer.from(await file.arrayBuffer())
        const filename = `id-documents/${patientId}/${Date.now()}-${file.name.replace(/\s/g, "-")}`

        const { url } = await uploadFile(buffer, filename, "carepulse/id-documents")

        await prisma.patient.update({
            where: { id: patientId },
            data:  { identificationDocumentUrl: url },
        })

        return NextResponse.json({ url })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
