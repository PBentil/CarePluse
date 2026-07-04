import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const search = searchParams.get("search")?.trim() ?? ""

        const drugs = await prisma.drug.findMany({
            where: {
                inStock: true,
                ...(search ? {
                    OR: [
                        { name:        { contains: search, mode: "insensitive" as const } },
                        { genericName: { contains: search, mode: "insensitive" as const } },
                    ],
                } : {}),
            },
            orderBy: { name: "asc" },
            take:    20,
        })

        return NextResponse.json({ drugs })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
