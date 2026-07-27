import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const data: Record<string, any> = {
            name:      body.name,
            specialty: body.specialty,
            email:     body.email,
        }

        if (body.password) {
            data.password = await bcrypt.hash(body.password, 10)
        }

        const doctor = await prisma.doctor.update({
            where: { id },
            data,
        })

        const { password: _, ...doctorSafe } = doctor
        return NextResponse.json(doctorSafe)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.doctor.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}