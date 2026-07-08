import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        const search = req.nextUrl.searchParams.get("search")?.trim() ?? ""
        const drugs = await prisma.drug.findMany({
            where: {
                hospitalId: doctor.hospitalId, inStock: true,
                ...(search ? { OR: [
                    { name:        { contains: search, mode: "insensitive" } },
                    { genericName: { contains: search, mode: "insensitive" } },
                ]} : {}),
            },
            orderBy: { name: "asc" }, take: 20,
        })
        return NextResponse.json({ drugs })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
