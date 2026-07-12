import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const hospital = await prisma.hospital.findUnique({
            where:  { slug },
            select: { id: true, name: true, slug: true, subscriptionStatus: true },
        })

        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
        if (hospital.subscriptionStatus === "expired") {
            return NextResponse.json({ error: "Subscription expired" }, { status: 403 })
        }

        return NextResponse.json(hospital)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
