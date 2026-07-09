import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Super admin
    if (pathname.startsWith("/superadmin")) {
        if (pathname === "/superadmin/login") return NextResponse.next()
        const superadmin = req.cookies.get("superadmin")?.value
        if (!superadmin) return NextResponse.redirect(new URL("/superadmin/login", req.url))
        return NextResponse.next()
    }

    // Public paths
    const publicPaths = ["/register", "/", "/api/hospitals", "/api/auth"]
    if (publicPaths.some(p => pathname === p || pathname.startsWith(p))) {
        return NextResponse.next()
    }

    // Slug-based routes: /[slug]/admin, /[slug]/doctor, /[slug]/patient, /[slug]/staff
    const slugMatch = pathname.match(/^\/([a-z0-9-]+)\/(admin|doctor|patient|staff)(\/.*)?$/)
    if (slugMatch) {
        const slug    = slugMatch[1]
        const portal  = slugMatch[2]
        const rest    = slugMatch[3] ?? ""

        // Allow login pages
        if (rest === "/login" || rest === "/login/" || rest === "/register" || rest === "/register/") return NextResponse.next()

        if (portal === "admin" || portal === "staff") {
            const staffId = req.cookies.get(`staff_${slug}`)?.value
            if (!staffId) return NextResponse.redirect(new URL(`/${slug}/admin/login`, req.url))
        }

        if (portal === "doctor") {
            const doctorId = req.cookies.get(`doctor_${slug}`)?.value
            if (!doctorId) return NextResponse.redirect(new URL(`/${slug}/doctor/login`, req.url))
        }

        if (portal === "patient") {
            const patientId = req.cookies.get(`patient_${slug}`)?.value
            if (!patientId) return NextResponse.redirect(new URL(`/${slug}/patient/login`, req.url))
        }

        return NextResponse.next()
    }

    // API slug routes
    const apiSlugMatch = pathname.match(/^\/api\/([a-z0-9-]+)\/(admin|doctor|patient|staff)(\/.*)?$/)
    if (apiSlugMatch) {
        const slug   = apiSlugMatch[1]
        const portal = apiSlugMatch[2]

        if (portal === "admin" || portal === "staff") {
            const staffId = req.cookies.get(`staff_${slug}`)?.value
            if (!staffId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        if (portal === "doctor") {
            const doctorId = req.cookies.get(`doctor_${slug}`)?.value
            if (!doctorId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        if (portal === "patient") {
            const patientId = req.cookies.get(`patient_${slug}`)?.value
            if (!patientId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
        }

        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/superadmin/:path*",
        "/register",
        "/:slug/admin/:path*",
        "/:slug/doctor/:path*",
        "/:slug/patient/:path*",
        "/:slug/staff/:path*",
        "/api/:slug/admin/:path*",
        "/api/:slug/doctor/:path*",
        "/api/:slug/patient/:path*",
        "/api/:slug/staff/:path*",
        "/api/auth/:path*",
    ],
}
