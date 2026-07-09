import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
        const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "10"))
        const search = searchParams.get("search")?.trim() ?? ""
        const skip   = (page - 1) * limit

        const where = search
            ? {
                OR: [
                    { fullName: { contains: search, mode: "insensitive" as const } },
                    { email:    { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    gender: true,
                    createdAt: true,
                },
            }),
            prisma.patient.count({ where }),
        ])

        return NextResponse.json({ patients, total })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const patient = await prisma.patient.create({
            data: {
                fullName:               body.fullName,
                email:                  body.email,
                phone:                  body.phone,
                dateOfBirth:            body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                gender:                 body.gender      || null,
                address:                body.address     || null,
                occupation:             body.occupation  || null,
                emergencyContactName:   body.emergencyContactName   || null,
                emergencyContactNumber: body.emergencyContactNumber || null,
                primaryPhysician:       body.primaryPhysician       || null,
                insuranceProvider:      body.insuranceProvider      || null,
                insurancePolicyNumber:  body.insurancePolicyNumber  || null,
                allergies:              body.allergies       || null,
                currentMedication:      body.currentMedication      || null,
                identificationType:     body.identificationType     || null,
                identificationNumber:   body.identificationNumber   || null,
                consentTerms:           true,
                consentPrivacy:         true,
                consentTreatment:       true,
            },
        })

        return NextResponse.json(patient, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}