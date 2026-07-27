import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where = search ? {
            OR: [
                { name:        { contains: search, mode: "insensitive" as const } },
                { genericName: { contains: search, mode: "insensitive" as const } },
                { category:    { contains: search, mode: "insensitive" as const } },
            ],
        } : {}

        const [drugs, total] = await Promise.all([
            prisma.drug.findMany({
                where,
                orderBy: { name: "asc" },
                skip,
                take: limit,
            }),
            prisma.drug.count({ where }),
        ])

        return NextResponse.json({ drugs, total })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, genericName, category, unit, price, inStock } = body

        if (!name || price === undefined) {
            return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
        }

        const drug = await prisma.drug.create({
            data: {
                name,
                genericName: genericName ?? null,
                category:    category    ?? null,
                unit:        unit        ?? "tablet",
                price:       parseFloat(price),
                inStock:     inStock     ?? true,
            },
        })

        return NextResponse.json(drug, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
