"use client"

import { useEffect, useState } from "react"
import {Pencil, Trash2} from "lucide-react"
import type { Patient } from "@/types"
import {Sheet} from "@/components/admin/sheet";

interface FullPatient extends Patient {
    dateOfBirth?: string
    address?: string
    occupation?: string
    emergencyContactName?: string
    emergencyContactNumber?: string
    primaryPhysician?: string
    insuranceProvider?: string
    insurancePolicyNumber?: string
    allergies?: string
    currentMedication?: string
    identificationType?: string
    identificationNumber?: string
    consentTreatment?: boolean
    consentPrivacy?: boolean
    consentTerms?: boolean
}

interface PatientDetailsProps {
    patientId: string | null
    onClose: () => void
    onEdit: (patient: Patient) => void
    onDelete: (patient: Patient) => void
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {title}
        </p>
        <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {children}
        </div>
    </div>
)

const Row = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex items-start justify-between px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 w-40">{label}</span>
        <span className="text-xs text-zinc-700 dark:text-zinc-200 text-right">
      {value || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
    </span>
    </div>
)

const Badge = ({ value }: { value?: boolean | null }) => (
    <div className="flex items-start justify-between px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
        value
            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
            : "bg-red-50 dark:bg-red-950 text-red-500"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-red-500"}`} />
        {value ? "Accepted" : "Not accepted"}
    </span>
    </div>
)

export function PatientDetails({ patientId, onClose, onEdit, onDelete }: PatientDetailsProps) {
    const [patient, setPatient] = useState<FullPatient | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!patientId) return
        setLoading(true)
        fetch(`/api/admin/patients/${patientId}`)
            .then((r) => r.json())
            .then((d) => { setPatient(d); setLoading(false) })
    }, [patientId])

    const initials = patient?.fullName
        .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    return (
        <Sheet
            open={!!patientId}
            onClose={onClose}
            title="Patient Details"
            description={patient?.fullName ?? "Loading..."}
        >
            {loading || !patient ? (
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-medium text-zinc-600 dark:text-zinc-300">
                                {initials}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{patient.fullName}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{patient.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onEdit(patient)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete(patient)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    <Section title="Personal Information">
                        <Row label="Phone"         value={patient.phone} />
                        <Row label="Date of Birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
                        <Row label="Gender"        value={patient.gender} />
                        <Row label="Address"       value={patient.address} />
                        <Row label="Occupation"    value={patient.occupation} />
                        <Row label="Registered"    value={new Date(patient.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                    </Section>

                    <Section title="Emergency Contact">
                        <Row label="Name"   value={patient.emergencyContactName} />
                        <Row label="Number" value={patient.emergencyContactNumber} />
                    </Section>

                    <Section title="Medical Information">
                        <Row label="Primary Physician"    value={patient.primaryPhysician} />
                        <Row label="Insurance Provider"   value={patient.insuranceProvider} />
                        <Row label="Policy Number"        value={patient.insurancePolicyNumber} />
                        <Row label="Allergies"            value={patient.allergies} />
                        <Row label="Current Medication"   value={patient.currentMedication} />
                    </Section>

                    <Section title="Identification">
                        <Row label="ID Type"   value={patient.identificationType} />
                        <Row label="ID Number" value={patient.identificationNumber} />
                    </Section>

                    <Section title="Consent & Privacy">
                        <div className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Treatment consent</span>
                            <Badge value={patient.consentTreatment} />
                        </div>
                        <div className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Disclosure consent</span>
                            <Badge value={patient.consentPrivacy} />
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Privacy policy</span>
                            <Badge value={patient.consentTerms} />
                        </div>
                    </Section>

                </div>
            )}
        </Sheet>
    )
}