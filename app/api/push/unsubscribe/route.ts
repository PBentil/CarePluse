import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const { endpoint } = await req.json()
        await prisma.pushSubscription.deleteMany({ where: { endpoint } })
        return NextResponse.json({ message: "Unsubscribed" })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
