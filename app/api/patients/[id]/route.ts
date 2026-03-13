import { prisma } from "@/lib/prisma"

  export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()
  
    if (body.dateOfBirth) {
      body.dateOfBirth = new Date(body.dateOfBirth)
    }
  
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        address: body.address,
        occupation: body.occupation,
        emergencyContactName: body.emergencyContactName,
        emergencyContactNumber: body.emergencyContactNumber,
        primaryPhysician: body.primaryCarePhysician,       // ← remap
        insuranceProvider: body.insuranceProvider,
        insurancePolicyNumber: body.insurancePolicyNumber,
        allergies: body.allergies,
        currentMedication: body.currentMedication,
        identificationType: body.identificationType,
        identificationNumber: body.identificationNumber,
        consentTreatment: body.treatmentConsent,           // ← remap
        consentPrivacy: body.disclosureConsent,            // ← remap
        consentTerms: body.privacyPolicy,                  // ← remap
      },
    })
  
    return Response.json(updatedPatient)
  }
