import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const doctorId = req.cookies.get("doctor")?.value

        if (!doctorId) {
            return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where: any = { primaryPhysicianId: doctorId }

        if (search) {
            where.AND = [
                { primaryPhysicianId: doctorId },
                {
                    OR: [
                        { fullName: { contains: search, mode: "insensitive" } },
                        { email:    { contains: search, mode: "insensitive" } },
                        { phone:    { contains: search, mode: "insensitive" } },
                    ],
                },
            ]
            delete where.primaryPhysicianId
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id:        true,
                    fullName:  true,
                    email:     true,
                    phone:     true,
                    gender:    true,
                    createdAt: true,
                },
            }),
            prisma.patient.count({ where }),
        ])

        return NextResponse.json({ patients, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}