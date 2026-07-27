import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function getHospitalFromSlug(slug: string) {
    return prisma.hospital.findUnique({ where: { slug } })
}

export async function getStaffFromRequest(req: NextRequest, slug: string) {
    const staffId = req.cookies.get(`staff_${slug}`)?.value
    if (!staffId) return null

    const hospital = await prisma.hospital.findUnique({ where: { slug } })
    if (!hospital) return null

    const staff = await prisma.staff.findFirst({
        where: { id: staffId, hospitalId: hospital.id, isActive: true },
        select: { id: true, name: true, email: true, role: true, hospitalId: true, clinicId: true },
    })

    return staff ? { ...staff, hospital } : null
}

export async function getDoctorFromRequest(req: NextRequest, slug: string) {
    const doctorId = req.cookies.get(`doctor_${slug}`)?.value
    if (!doctorId) return null

    const hospital = await prisma.hospital.findUnique({ where: { slug } })
    if (!hospital) return null

    const doctor = await prisma.doctor.findFirst({
        where: { id: doctorId, hospitalId: hospital.id, isActive: true },
        select: { id: true, name: true, email: true, specialty: true, hospitalId: true, clinicId: true },
    })

    return doctor ? { ...doctor, hospital } : null
}

export async function getPatientFromRequest(req: NextRequest, slug: string) {
    const patientId = req.cookies.get(`patient_${slug}`)?.value
    if (!patientId) return null

    const hospital = await prisma.hospital.findUnique({ where: { slug } })
    if (!hospital) return null

    const patient = await prisma.patient.findFirst({
        where: { id: patientId, hospitalId: hospital.id },
        select: { id: true, fullName: true, email: true, hospitalId: true },
    })

    return patient ? { ...patient, hospital } : null
}

export async function getSuperAdminFromRequest(req: NextRequest) {
    const adminId = req.cookies.get("superadmin")?.value
    if (!adminId) return null

    return prisma.superAdmin.findUnique({
        where:  { id: adminId },
        select: { id: true, email: true },
    })
}
