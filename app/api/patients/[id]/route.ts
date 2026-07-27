import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.dateOfBirth) {
      body.dateOfBirth = new Date(body.dateOfBirth)
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        fullName:               body.fullName,
        email:                  body.email,
        phone:                  body.phone,
        dateOfBirth:            body.dateOfBirth,
        gender:                 body.gender,
        address:                body.address,
        occupation:             body.occupation,
        emergencyContactName:   body.emergencyContactName,
        emergencyContactNumber: body.emergencyContactNumber,
        primaryPhysician: {
          connect : { id: body.primaryPhysicianId },
        },
        insuranceProvider:      body.insuranceProvider,
        insurancePolicyNumber:  body.insurancePolicyNumber,
        allergies:              body.allergies,
        currentMedication:      body.currentMedication,
        identificationType:     body.identificationType,
        identificationNumber:   body.identificationNumber,
        consentTreatment:       body.treatmentConsent,
        consentPrivacy:         body.disclosureConsent,
        consentTerms:           body.privacyPolicy,
      },
    })

    return NextResponse.json(updatedPatient)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}