import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function getAdminFromRequest(req: NextRequest) {
    const adminCookie = req.cookies.get("admin")?.value
    if (!adminCookie) return null

    const admin = await prisma.admin.findFirst({
        where: { id: adminCookie },
        select: { id: true, email: true },
    })

    return admin ?? null
}

export async function getDoctorFromRequest(req: NextRequest) {
    const doctorId = req.cookies.get("doctor")?.value
    if (!doctorId) return null

    const doctor = await prisma.doctor.findUnique({
        where:  { id: doctorId },
        select: { id: true, name: true, email: true, specialty: true },
    })

    return doctor ?? null
}

export async function getPatientFromRequest(req: NextRequest) {
    const patientId = req.cookies.get("patient")?.value
    if (!patientId) return null

    const patient = await prisma.patient.findUnique({
        where:  { id: patientId },
        select: { id: true, fullName: true, email: true },
    })

    return patient ?? null
}
