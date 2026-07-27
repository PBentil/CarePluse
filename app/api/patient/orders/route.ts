import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const patientId = req.cookies.get("patient")?.value
        if (!patientId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const orders = await prisma.order.findMany({
            where:   { patientId },
            orderBy: { createdAt: "desc" },
            include: {
                prescription: {
                    include: {
                        items:  true,
                        doctor: { select: { name: true } },
                    },
                },
            },
        })

        return NextResponse.json({ orders })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
