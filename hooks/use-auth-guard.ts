
"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

type PortalType = "doctor" | "patient" | "staff"

export function useAuthGuard(portal: PortalType) {
    const { slug } = useParams<{ slug: string }>()
    const router   = useRouter()

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [k, v] = c.trim().split("=")
            acc[k] = v
            return acc
        }, {} as Record<string, string>)

        const cookieMap: Record<PortalType, string> = {
            doctor:  `doctor_${slug}_name`,
            patient: `patient_${slug}_name`,
            staff:   `staff_${slug}_name`,
        }

        const loginMap: Record<PortalType, string> = {
            doctor:  `/${slug}/doctor/login`,
            patient: `/${slug}/patient/login`,
            staff:   `/${slug}/admin/login`,
        }

        if (!cookies[cookieMap[portal]]) {
            router.replace(loginMap[portal])
        }
    }, [slug, portal, router])
}
