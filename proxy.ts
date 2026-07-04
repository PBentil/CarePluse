import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const isAdmin   = req.cookies.get("admin")?.value
    const doctorId  = req.cookies.get("doctor")?.value
    const patientId = req.cookies.get("patient")?.value

    // Public routes - always allow
    const publicPaths = [
        "/admin/login",
        "/doctor/login",
        "/patient/login",
        "/api/admin/login",
        "/api/doctor/login",
        "/api/patient/send-otp",
        "/api/patient/verify-otp",
    ]

    if (publicPaths.some(p => pathname === p || pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // Protect admin pages and API
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!isAdmin) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
            }
            return NextResponse.redirect(new URL("/admin/login", req.url))
        }
    }

    // Protect doctor pages and API
    if (pathname.startsWith("/doctor") || pathname.startsWith("/api/doctor")) {
        if (!doctorId) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
            }
            return NextResponse.redirect(new URL("/doctor/login", req.url))
        }
    }

    // Protect patient pages and API
    if (pathname.startsWith("/patient") || pathname.startsWith("/api/patient")) {
        if (!patientId) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
            }
            return NextResponse.redirect(new URL("/patient/login", req.url))
        }
    }

    // Protect call pages
    if (pathname.startsWith("/call")) {
        if (!doctorId && !patientId && !isAdmin) {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/doctor/:path*",
        "/patient/:path*",
        "/call/:path*",
        "/api/admin/:path*",
        "/api/doctor/:path*",
        "/api/patient/:path*",
    ],
}
