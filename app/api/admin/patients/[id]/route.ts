import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const patient = await prisma.patient.findUnique({ where: { id } })
        if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 })
        return NextResponse.json(patient)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                fullName:               body.fullName,
                email:                  body.email,
                phone:                  body.phone,
                dateOfBirth:            body.dateOfBirth ? new Date(body.dateOfBirth) : null,
                gender:                 body.gender               || null,
                address:                body.address              || null,
                occupation:             body.occupation           || null,
                emergencyContactName:   body.emergencyContactName  || null,
                emergencyContactNumber: body.emergencyContactNumber || null,
                primaryPhysician:       body.primaryPhysician      || null,
                insuranceProvider:      body.insuranceProvider     || null,
                insurancePolicyNumber:  body.insurancePolicyNumber || null,
                allergies:              body.allergies             || null,
                currentMedication:      body.currentMedication    || null,
                identificationType:     body.identificationType   || null,
                identificationNumber:   body.identificationNumber || null,
            },
        })

        return NextResponse.json(patient)
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
        await prisma.patient.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}