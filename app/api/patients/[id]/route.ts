import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params
    const body = await req.json()
  
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        address: body.address,
        occupation: body.occupation,
        emergencyContactName: body.emergencyContactName,
        emergencyContactNumber: body.emergencyContactNumber,
  
        primaryPhysician: body.primaryCarePhysician,
  
        insuranceProvider: body.insuranceProvider,
        insurancePolicyNumber: body.insurancePolicyNumber,
  
        allergies: body.allergies,
        currentMedication: body.currentMedication,
  
        identificationType: body.identificationType,
        identificationNumber: body.identificationNumber,
  
        consentTreatment: body.treatmentConsent,
        consentPrivacy: body.privacyPolicy,
        consentTerms: body.disclosureConsent,
      },
    })
  
    return Response.json(updatedPatient)
  }
  