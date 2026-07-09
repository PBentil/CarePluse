import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const response = NextResponse.json({ message: "Logged out" })
    const expired  = new Date(0)
    response.cookies.set(`patient_${slug}`,      "", { expires: expired, path: "/" })
    response.cookies.set(`patient_${slug}_name`, "", { expires: expired, path: "/" })
    response.cookies.set(`hospital_${slug}`,     "", { expires: expired, path: "/" })
    return response
}
