
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast, Toaster } from "@/components/ui/sonner"
import { Logo } from "@/components/logo"
import { Loader2 } from "lucide-react"
import Link from "next/link"

const inputClass = "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1.5"
const genders  = ["Male","Female","Other"]
const idTypes  = ["Ghana Card","Health Insurance","Passport","Driver License"]

interface Doctor { id: string; name: string; specialty: string }

export default function PatientRegisterPage() {
    const { slug }  = useParams<{ slug: string }>()
    const router    = useRouter()
    const [step, setStep]     = useState<"basic"|"medical">("basic")
    const [loading, setLoading] = useState(false)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [form, setForm]     = useState({
        fullName: "", email: "", phone: "", dateOfBirth: "", gender: "",
        address: "", occupation: "", emergencyContactName: "", emergencyContactNumber: "",
        primaryPhysicianId: "", insuranceProvider: "", insurancePolicyNumber: "",
        allergies: "", currentMedication: "", identificationType: "", identificationNumber: "",
        treatmentConsent: false, disclosureConsent: false, privacyPolicy: false,
    })

    useEffect(() => {
        fetch(`/api/${slug}/public/doctors`)
            .then(r => r.json())
            .then(d => setDoctors(d.doctors ?? []))
    }, [slug])

    const update = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

    const handleBasicNext = () => {
        if (!form.fullName || !form.email || !form.phone) { toast.error("Name, email and phone are required"); return }
        setStep("medical")
    }

    const handleSubmit = async () => {
        if (!form.treatmentConsent || !form.disclosureConsent || !form.privacyPolicy) {
            toast.error("Please accept all consents"); return
        }
        setLoading(true)
        try {
            const res  = await fetch(`/api/${slug}/patient/register`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Registration successful! You can now log in.")
            router.push(`/${slug}/patient/login`)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Error")
        } finally { setLoading(false) }
    }

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-zinc-50 flex flex-col">
                <header className="px-8 py-5 border-b border-zinc-100 bg-white">
                    <Logo />
                </header>
                <div className="flex flex-1 items-start justify-center px-4 py-12">
                    <div className="w-full max-w-xl space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-900">Patient Registration</h1>
                            <p className="text-sm text-zinc-500 mt-1">
                                {step === "basic" ? "Step 1 of 2 — Basic information" : "Step 2 of 2 — Medical information"}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                            {step === "basic" ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2"><label className={labelClass}>Full name *</label><input value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="Kofi Mensah" className={inputClass} /></div>
                                        <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="kofi@example.com" className={inputClass} /></div>
                                        <div><label className={labelClass}>Phone *</label><input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+233 ..." className={inputClass} /></div>
                                        <div><label className={labelClass}>Date of birth</label><input type="date" value={form.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className={inputClass} /></div>
                                        <div>
                                            <label className={labelClass}>Gender</label>
                                            <select value={form.gender} onChange={e => update("gender", e.target.value)} className={inputClass}>
                                                <option value="">Select</option>
                                                {genders.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2"><label className={labelClass}>Address</label><input value={form.address} onChange={e => update("address", e.target.value)} placeholder="123 Main St, Accra" className={inputClass} /></div>
                                        <div><label className={labelClass}>Occupation</label><input value={form.occupation} onChange={e => update("occupation", e.target.value)} placeholder="e.g. Teacher" className={inputClass} /></div>
                                        <div><label className={labelClass}>Emergency contact name</label><input value={form.emergencyContactName} onChange={e => update("emergencyContactName", e.target.value)} className={inputClass} /></div>
                                        <div className="col-span-2"><label className={labelClass}>Emergency contact phone</label><input value={form.emergencyContactNumber} onChange={e => update("emergencyContactNumber", e.target.value)} className={inputClass} /></div>
                                    </div>
                                    <button onClick={handleBasicNext} className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Continue</button>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelClass}>Primary doctor</label>
                                            <select value={form.primaryPhysicianId} onChange={e => update("primaryPhysicianId", e.target.value)} className={inputClass}>
                                                <option value="">Select doctor</option>
                                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>Insurance provider</label><input value={form.insuranceProvider} onChange={e => update("insuranceProvider", e.target.value)} placeholder="e.g. NHIS" className={inputClass} /></div>
                                        <div><label className={labelClass}>Policy number</label><input value={form.insurancePolicyNumber} onChange={e => update("insurancePolicyNumber", e.target.value)} className={inputClass} /></div>
                                        <div><label className={labelClass}>Allergies</label><input value={form.allergies} onChange={e => update("allergies", e.target.value)} placeholder="e.g. Penicillin" className={inputClass} /></div>
                                        <div><label className={labelClass}>Current medication</label><input value={form.currentMedication} onChange={e => update("currentMedication", e.target.value)} placeholder="e.g. Paracetamol" className={inputClass} /></div>
                                        <div>
                                            <label className={labelClass}>ID type</label>
                                            <select value={form.identificationType} onChange={e => update("identificationType", e.target.value)} className={inputClass}>
                                                <option value="">Select</option>
                                                {idTypes.map(i => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>ID number</label><input value={form.identificationNumber} onChange={e => update("identificationNumber", e.target.value)} className={inputClass} /></div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {[
                                            { field: "treatmentConsent",  label: "I consent to receive treatment for my health condition." },
                                            { field: "disclosureConsent", label: "I agree to disclosure of my medical information as necessary." },
                                            { field: "privacyPolicy",     label: "I have read and agree to the privacy policy." },
                                        ].map(({ field, label }) => (
                                            <label key={field} className="flex items-start gap-3 cursor-pointer">
                                                <div className="relative mt-0.5">
                                                    <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => update(field, e.target.checked)} className="peer h-4 w-4 rounded border-zinc-300 appearance-none bg-white border checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                                                    <svg className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                                <span className="text-sm text-zinc-600">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setStep("basic")} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Back</button>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {loading ? "Registering..." : "Complete registration"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="text-center text-xs text-zinc-400">
                            Already registered?{" "}
                            <Link href={`/${slug}/patient/login`} className="text-primary hover:underline">Sign in here</Link>
                        </p>
                    </div>
                </div>
                <footer className="px-8 py-5 border-t border-zinc-100 text-center text-xs text-zinc-400">
                    © {new Date().getFullYear()} CarePulse
                </footer>
            </div>
        </>
    )
}
