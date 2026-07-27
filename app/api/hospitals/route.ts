import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSlug, ensureUniqueSlug } from "@/lib/slug"
import { PLANS, PlanKey } from "@/lib/plans"
import bcrypt from "bcrypt"
import { sendEmail } from "@/lib/notification"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, phone, address, plan, paystackRef } = body

        if (!name || !email || !phone || !plan) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (!PLANS[plan as PlanKey]) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
        }

        const existing = await prisma.hospital.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: "A hospital with this email already exists" }, { status: 409 })
        }

        const baseSlug = generateSlug(name)
        const slug     = await ensureUniqueSlug(baseSlug, async (s) => {
            const h = await prisma.hospital.findUnique({ where: { slug: s } })
            return !!h
        })

        const tempPassword  = Math.random().toString(36).slice(2, 10).toUpperCase()
        const hashedPassword = await bcrypt.hash(tempPassword, 10)

        const planData = PLANS[plan as PlanKey]
        const now      = new Date()
        const expiry   = new Date(now)
        expiry.setMonth(expiry.getMonth() + 1)

        const hospital = await prisma.hospital.create({
            data: {
                name,
                slug,
                email,
                phone,
                address:            address ?? null,
                plan,
                subscriptionStatus: paystackRef ? "active" : "trial",
                subscriptionExpiry: expiry,
                clinics: {
                    create: {
                        name:      `${name} — Main Branch`,
                        isDefault: true,
                    },
                },
                staff: {
                    create: {
                        name:     "Hospital Admin",
                        email,
                        password: hashedPassword,
                        role:     "hospital_admin",
                    },
                },
                ...(paystackRef ? {
                    subscription: {
                        create: {
                            plan,
                            status:             "active",
                            amount:             planData.price,
                            paystackRef,
                            currentPeriodStart: now,
                            currentPeriodEnd:   expiry,
                        },
                    },
                } : {}),
            },
        })

        await sendEmail({
            to:      email,
            subject: `Welcome to CarePulse — Your hospital is ready`,
            html: `
                <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
                    <h2 style="color:#18181b;">Welcome to CarePulse, ${name}!</h2>
                    <p style="color:#71717a;">Your hospital portal is ready. Here are your login details:</p>
                    <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin:20px 0;">
                        <p style="margin:4px 0;color:#18181b;"><strong>Your hospital URL:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/${slug}</p>
                        <p style="margin:4px 0;color:#71717a;font-size:13px;">Share this URL with your doctors, nurses, and patients — they will see their own login option.</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Email:</strong> ${email}</p>
                        <p style="margin:4px 0;color:#18181b;"><strong>Temporary password:</strong> ${tempPassword}</p>
                    </div>
                    <p style="color:#71717a;font-size:13px;">Please change your password after your first login.</p>
                    <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse — Powering modern healthcare.</p>
                </div>
            `,
        })

        return NextResponse.json({
            hospital: { id: hospital.id, slug, name },
            message:  "Hospital created successfully",
        }, { status: 201 })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
