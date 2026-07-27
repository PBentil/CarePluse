"use client"

import { useEffect, useState } from "react"
import type { Patient } from "@/types"
import { Sheet } from "@/components/admin/sheet"
import type { Appointment, AppointmentStatus } from "@/types"
import { DoctorAppointmentActions } from "@/components/doctor/appointment-actions"

interface FullPatient extends Patient {
    dateOfBirth?: string
    address?: string
    occupation?: string
    emergencyContactName?: string
    emergencyContactNumber?: string
    primaryPhysician?: { name: string }
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

interface DoctorPatientDetailsProps {
    patientId: string | null
    onClose: () => void
    onAppointmentChange: () => void
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

const statusStyles: Record<AppointmentStatus, string> = {
    pending:     "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    confirmed:   "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    rejected:    "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
    rescheduled: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
}

export function DoctorPatientDetails({ patientId, onClose, onAppointmentChange }: DoctorPatientDetailsProps) {
    const [patient, setPatient]           = useState<FullPatient | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading]           = useState(false)

    useEffect(() => {
        if (!patientId) return
        setLoading(true)

        Promise.all([
            fetch(`/api/admin/patients/${patientId}`).then(r => r.json()),
            fetch(`/api/doctor/appointments?limit=100`).then(r => r.json()),
        ]).then(([patientData, apptData]) => {
            setPatient(patientData)
            setAppointments(
                (apptData.appointments ?? []).filter(
                    (a: Appointment) => a.patientId === patientId
                )
            )
            setLoading(false)
        })
    }, [patientId])

    const initials = patient?.fullName
        .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    const handleAppointmentSuccess = () => {
        onAppointmentChange()
        fetch(`/api/doctor/appointments?limit=100`)
            .then(r => r.json())
            .then(d => setAppointments(
                (d.appointments ?? []).filter((a: Appointment) => a.patientId === patientId)
            ))
    }

    return (
        <Sheet
            open={!!patientId}
            onClose={onClose}
            title="Patient details"
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

                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-medium text-zinc-600 dark:text-zinc-300">
                            {initials}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{patient.fullName}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{patient.email}</p>
                            <p className="text-xs text-zinc-400">{patient.phone}</p>
                        </div>
                    </div>

                    <Section title="Personal information">
                        <Row label="Date of birth" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
                        <Row label="Gender"        value={patient.gender} />
                        <Row label="Address"       value={patient.address} />
                        <Row label="Occupation"    value={patient.occupation} />
                    </Section>

                    <Section title="Emergency contact">
                        <Row label="Name"   value={patient.emergencyContactName} />
                        <Row label="Number" value={patient.emergencyContactNumber} />
                    </Section>

                    <Section title="Medical information">
                        <Row label="Insurance provider" value={patient.insuranceProvider} />
                        <Row label="Policy number"      value={patient.insurancePolicyNumber} />
                        <Row label="Allergies"          value={patient.allergies} />
                        <Row label="Current medication" value={patient.currentMedication} />
                    </Section>

                    <Section title="Identification">
                        <Row label="ID type"   value={patient.identificationType} />
                        <Row label="ID number" value={patient.identificationNumber} />
                    </Section>

                    <Section title="Appointments">
                        {appointments.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-zinc-400">
                                No appointments with this patient yet
                            </div>
                        ) : (
                            appointments.map((appt) => (
                                <div key={appt.id} className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <p className="text-xs text-zinc-700 dark:text-zinc-200">
                                                {new Date(appt.rescheduledDate ?? appt.date).toLocaleDateString("en-GB", {
                                                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                                                })}
                                            </p>
                                            <p className="text-xs text-zinc-400">{appt.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${statusStyles[appt.status]}`}>
                                                {appt.status}
                                            </span>
                                            <DoctorAppointmentActions
                                                appointment={appt}
                                                onSuccess={handleAppointmentSuccess}
                                            />
                                        </div>
                                    </div>
                                    {appt.notes && (
                                        <p className="mt-2 text-xs text-zinc-400 italic">{appt.notes}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </Section>

                </div>
            )}
        </Sheet>
    )
}