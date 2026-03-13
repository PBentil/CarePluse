import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patientSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(7),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validatedData = patientSchema.parse(body)

    const newPatient = await prisma.patient.create({
      data: validatedData,
    })

    return NextResponse.json(newPatient, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 400 }
    )
  }
}
