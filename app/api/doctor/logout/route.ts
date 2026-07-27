import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" })
    response.cookies.set("doctor",     "", { expires: new Date(0), path: "/" })
    response.cookies.set("doctorName", "", { expires: new Date(0), path: "/" })
    return response
}
