import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDoctorFromRequest } from "@/lib/auth"
import bcrypt from "bcrypt"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const doctor   = await getDoctorFromRequest(req, slug)
        if (!doctor) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { currentPassword, newPassword } = await req.json()

        const full = await prisma.doctor.findUnique({ where: { id: doctor.id } })
        if (!full) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const isMatch = await bcrypt.compare(currentPassword, full.password)
        if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })

        await prisma.doctor.update({
            where: { id: doctor.id },
            data:  { password: await bcrypt.hash(newPassword, 10) },
        })

        return NextResponse.json({ message: "Password updated" })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
