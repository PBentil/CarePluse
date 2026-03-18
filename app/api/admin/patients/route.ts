import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                gender: true,
                createdAt: true,
            },
        })
        return NextResponse.json(patients)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}