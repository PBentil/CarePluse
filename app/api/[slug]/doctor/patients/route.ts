import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where: any = { primaryPhysicianId: doctor.id, hospitalId: doctor.hospitalId }
        if (search) {
            where.AND = [
                { primaryPhysicianId: doctor.id, hospitalId: doctor.hospitalId },
                { OR: [
                    { fullName: { contains: search, mode: "insensitive" } },
                    { email:    { contains: search, mode: "insensitive" } },
                    { phone:    { contains: search, mode: "insensitive" } },
                ]},
            ]
            delete where.primaryPhysicianId
            delete where.hospitalId
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where, orderBy: { createdAt: "desc" }, skip, take: limit,
                select: { id: true, fullName: true, email: true, phone: true, gender: true, createdAt: true },
            }),
            prisma.patient.count({ where }),
        ])

        return NextResponse.json({ patients, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
