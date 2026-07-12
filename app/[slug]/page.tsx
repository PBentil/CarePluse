
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { ShieldCheck, Stethoscope, UserCircle, Users, Loader2, AlertCircle } from "lucide-react"

interface Hospital {
    id:   string
    name: string
    slug: string
}

const portals = [
    {
        key:         "admin",
        title:       "Admin & Staff",
        description: "Hospital admin, nurses, receptionists, pharmacists",
        icon:        ShieldCheck,
        color:       "text-purple-600",
        bg:          "bg-purple-50",
        border:      "hover:border-purple-200",
        roles:       ["Hospital Admin", "Nurse", "Receptionist", "Pharmacist"],
        href:        (slug: string) => `/${slug}/admin/login`,
    },
    {
        key:         "doctor",
        title:       "Doctor",
        description: "Access your patients, appointments and consultations",
        icon:        Stethoscope,
        color:       "text-blue-600",
        bg:          "bg-blue-50",
        border:      "hover:border-blue-200",
        roles:       ["Doctor"],
        href:        (slug: string) => `/${slug}/doctor/login`,
    },
    {
        key:         "patient",
        title:       "Patient",
        description: "Book appointments, view results and track your health",
        icon:        UserCircle,
        color:       "text-emerald-600",
        bg:          "bg-emerald-50",
        border:      "hover:border-emerald-200",
        roles:       ["Patient"],
        href:        (slug: string) => `/${slug}/patient/login`,
    },
]

export default function HospitalLandingPage() {
    const { slug }        = useParams<{ slug: string }>()
    const router          = useRouter()
    const [hospital, setHospital] = useState<Hospital | null>(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState("")

    useEffect(() => {
        fetch(`/api/${slug}/info`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setError(data.error)
                else setHospital(data)
                setLoading(false)
            })
            .catch(() => { setError("Failed to load hospital"); setLoading(false) })
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (error || !hospital) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4">
                <Logo />
                <div className="text-center mt-8 space-y-3">
                    <div className="flex justify-center">
                        <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-lg font-semibold text-zinc-900">Hospital not found</h1>
                    <p className="text-sm text-zinc-500 max-w-sm">
                        {error === "Subscription expired"
                            ? "This hospital subscription has expired. Please contact your administrator."
                            : `No hospital found at carepulse.com/${slug}. Please check the URL.`
                        }
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Back to home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <header className="px-8 py-5 border-b border-zinc-100 bg-white">
                <Logo />
            </header>

            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg space-y-6 md:space-y-8">

                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900">{hospital.name}</h1>
                        <p className="text-sm text-zinc-500">Select your portal to sign in</p>
                    </div>

                    <div className="space-y-3">
                        {portals.map(({ key, title, description, icon: Icon, color, bg, border, roles, href }) => (
                            <div
                                key={key}
                                className={`w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-100 ${border} hover:shadow-sm transition-all`}
                            >
                                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-900">{title}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {roles.map(role => (
                                            <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-xs">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {key === "patient" ? (
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => router.push(href(slug))}
                                            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Sign in
                                        </button>
                                        <button
                                            onClick={() => router.push(`/${slug}/patient/register`)}
                                            className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 transition-colors"
                                        >
                                            Register
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => router.push(href(slug))}
                                        className="shrink-0 text-zinc-300 text-lg hover:text-zinc-500 transition-colors"
                                    >
                                        →
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-zinc-300">
                            {hospital.name} · Powered by CarePulse
                        </p>
                    </div>

                </div>
            </div>

            <footer className="px-8 py-5 border-t border-zinc-100 text-center text-xs text-zinc-400">
                © {new Date().getFullYear()} CarePulse
            </footer>
        </div>
    )
}
