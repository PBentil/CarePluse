import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const body     = await req.json()

        const hospital = await prisma.hospital.findUnique({ where: { slug } })
        if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })

        if (body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth)

        const patient = await prisma.patient.create({
            data: {
                hospitalId:              hospital.id,
                fullName:                body.fullName,
                email:                   body.email,
                phone:                   body.phone,
                dateOfBirth:             body.dateOfBirth ?? null,
                gender:                  body.gender ?? null,
                address:                 body.address ?? null,
                occupation:              body.occupation ?? null,
                emergencyContactName:    body.emergencyContactName ?? null,
                emergencyContactNumber:  body.emergencyContactNumber ?? null,
                primaryPhysicianId:      body.primaryPhysicianId ?? null,
                insuranceProvider:       body.insuranceProvider ?? null,
                insurancePolicyNumber:   body.insurancePolicyNumber ?? null,
                allergies:               body.allergies ?? null,
                currentMedication:       body.currentMedication ?? null,
                identificationType:      body.identificationType ?? null,
                identificationNumber:    body.identificationNumber ?? null,
                consentTreatment:        body.treatmentConsent ?? null,
                consentPrivacy:          body.disclosureConsent ?? null,
                consentTerms:            body.privacyPolicy ?? null,
            },
        })

        return NextResponse.json(patient, { status: 201 })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
