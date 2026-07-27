import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { slug } = await req.json()
        const response = NextResponse.json({ message: "Logged out" })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
        const expired  = new Date(0)

        response.cookies.set(`staff_${slug}`,      "", { expires: expired, path: "/" })
        response.cookies.set(`staff_${slug}_role`, "", { expires: expired, path: "/" })
        response.cookies.set(`staff_${slug}_name`, "", { expires: expired, path: "/" })
        response.cookies.set(`hospital_${slug}`,   "", { expires: expired, path: "/" })

        return response
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
