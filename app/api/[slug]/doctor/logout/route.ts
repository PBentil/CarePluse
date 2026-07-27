import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const response = NextResponse.json({ message: "Logged out" })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    const expired  = new Date(0)
    response.cookies.set(`doctor_${slug}`,      "", { expires: expired, path: "/" })
    response.cookies.set(`doctor_${slug}_name`, "", { expires: expired, path: "/" })
    response.cookies.set(`hospital_${slug}`,    "", { expires: expired, path: "/" })
    return response
}
