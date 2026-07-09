import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSuperAdminFromRequest } from "@/lib/auth"
import bcrypt from "bcrypt"

export async function PATCH(req: NextRequest) {
    try {
        const admin = await getSuperAdminFromRequest(req)
        if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { currentPassword, newPassword } = await req.json()

        const superAdmin = await prisma.superAdmin.findUnique({ where: { id: admin.id } })
        if (!superAdmin) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const isMatch = await bcrypt.compare(currentPassword, superAdmin.password)
        if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.superAdmin.update({ where: { id: admin.id }, data: { password: hashedPassword } })

        return NextResponse.json({ message: "Password updated successfully" })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
