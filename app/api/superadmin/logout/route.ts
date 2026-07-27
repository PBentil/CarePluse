import { NextResponse } from "next/server"

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" })
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.cookies.set("superadmin", "", { expires: new Date(0), path: "/" })
    return response
}
