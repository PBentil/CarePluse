import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where: any = { hospitalId: staff.hospitalId }
        if (search) {
            where.OR = [
                { name:        { contains: search, mode: "insensitive" } },
                { genericName: { contains: search, mode: "insensitive" } },
                { category:    { contains: search, mode: "insensitive" } },
            ]
        }

        const [drugs, total] = await Promise.all([
            prisma.drug.findMany({ where, orderBy: { name: "asc" }, skip, take: limit }),
            prisma.drug.count({ where }),
        ])

        return NextResponse.json({ drugs, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const drug = await prisma.drug.create({
            data: {
                hospitalId:  staff.hospitalId,
                name:        body.name,
                genericName: body.genericName ?? null,
                category:    body.category    ?? null,
                unit:        body.unit        ?? "tablet",
                price:       parseFloat(body.price),
                inStock:     body.inStock     ?? true,
            },
        })

        return NextResponse.json(drug, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
