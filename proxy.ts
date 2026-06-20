import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAdmin   = req.cookies.get("admin")
  const doctorId  = req.cookies.get("doctor")
  const patientId = req.cookies.get("patient")

  if (
      pathname === "/admin/login" ||
      pathname === "/doctor/login" ||
      pathname === "/patient/login"
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  if (pathname.startsWith("/doctor")) {
    if (!doctorId) return NextResponse.redirect(new URL("/doctor/login", req.url))
  }

  if (pathname.startsWith("/patient")) {
    if (!patientId) return NextResponse.redirect(new URL("/patient/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/patient/:path*"],
}