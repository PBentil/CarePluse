import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getStaffFromRequest } from "@/lib/auth"
import bcrypt from "bcrypt"
import { sendEmail } from "@/lib/notification"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const { searchParams } = req.nextUrl
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const skip  = (page - 1) * limit

        const [members, total] = await Promise.all([
            prisma.staff.findMany({
                where: { hospitalId: staff.hospitalId },
                orderBy: { createdAt: "desc" },
                skip, take: limit,
                select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
            }),
            prisma.staff.count({ where: { hospitalId: staff.hospitalId } }),
        ])

        return NextResponse.json({ staff: members, total })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const staff    = await getStaffFromRequest(req, slug)
        if (!staff) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const hospital = await prisma.hospital.findUnique({ where: { id: staff.hospitalId } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        const body     = await req.json()
        const password = body.password || Math.random().toString(36).slice(2, 10).toUpperCase()
        const hashedPassword = await bcrypt.hash(password, 10)

        const member = await prisma.staff.create({
            data: {
                hospitalId: staff.hospitalId,
                name:       body.name,
                email:      body.email,
                password:   hashedPassword,
                role:       body.role,
            },
        })

        await sendEmail({
            to:      body.email,
            subject: `You have been added to ${hospital.name} on CarePulse`,
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                    <h2 style="color:#18181b;">Welcome to ${hospital.name}</h2>
                    <p style="color:#71717a;">Hi ${body.name},</p>
                    <p style="color:#71717a;">You have been added as a <strong>${body.role.replace("_", " ")}</strong> on CarePulse.</p>
                    <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:20px 0;">
                        <p style="margin:4px 0;color:#18181b;"><strong>Portal:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/${slug}/admin/login</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Email:</strong> ${body.email}</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p style="color:#71717a;font-size:13px;">Please change your password after your first login.</p>
                    <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse — Powering modern healthcare.</p>
                </div>
            `,
        })

        const { password: _, ...safe } = member
        return NextResponse.json(safe, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
