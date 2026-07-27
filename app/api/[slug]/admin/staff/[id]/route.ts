import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"
import bcrypt from "bcrypt"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const body = await req.json()
        const data: any = { name: body.name, email: body.email, role: body.role, isActive: body.isActive }
        if (body.password) data.password = await bcrypt.hash(body.password, 10)

        const member = await prisma.staff.update({ where: { id }, data })
        const { password: _, ...safe } = member
        return NextResponse.json(safe)
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
    try {
        const { slug, id } = await params
        const staff = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        await prisma.staff.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
