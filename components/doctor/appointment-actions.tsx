"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CheckCircle2, XCircle, CalendarClock, Video } from "lucide-react"
import { ConsultationNotes } from "@/components/doctor/consultation-notes"
import { OrderLabTests } from "@/components/doctor/order-lab-tests"
import type { Appointment } from "@/types"
import { Modal } from "@/components/admin/modal"

interface AppointmentActionsProps {
    appointment: Appointment
    onSuccess: () => void
}

type ActionType = "confirm" | "reject" | "reschedule" | null

const inputClass = "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all"
const labelClass = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"

export function DoctorAppointmentActions({ appointment, onSuccess }: AppointmentActionsProps) {
    const [action, setAction]                   = useState<ActionType>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [rescheduledDate, setRescheduledDate] = useState("")
    const [loading, setLoading]                 = useState(false)

    const handleSubmit = async () => {
        if (action === "reject" && !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason")
            return
        }
        if (action === "reschedule" && !rescheduledDate) {
            toast.error("Please select a new date")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/doctor/appointments/${appointment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, rejectionReason, rescheduledDate }),
            })

            if (!res.ok) throw new Error("Action failed")

            const messages = {
                confirm:    "Appointment confirmed — patient notified with video link",
                reject:     "Appointment rejected — patient notified",
                reschedule: "Appointment rescheduled — patient notified",
            }

            toast.success(messages[action!])
            setAction(null)
            setRejectionReason("")
            setRescheduledDate("")
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const isPending   = appointment.status === "pending"
    const isConfirmed = appointment.status === "confirmed"

    return (
        <>
            <div className="flex items-center gap-1">

                {isConfirmed && (
                    <ConsultationNotes
                        appointment={appointment}
                        onSuccess={onSuccess}
                    />
                )}

                {isConfirmed && (
                    <OrderLabTests
                        appointmentId={appointment.id}
                        patientId={appointment.patientId}
                        patientName={appointment.patient.fullName}
                        onSuccess={onSuccess}
                    />
                )}

                {isConfirmed && appointment.videoRoomName && (

                    <a
                        href={`/call/${appointment.videoRoomName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Join video call"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                        <Video className="h-3.5 w-3.5" />
                    </a>
                )}

                {(isPending || isConfirmed) && (
                    <button
                        onClick={() => setAction("reschedule")}
                        title="Reschedule"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
                    >
                        <CalendarClock className="h-3.5 w-3.5" />
                    </button>
                )}

                {isPending && (
                    <>
                        <button
                            onClick={() => setAction("confirm")}
                            title="Confirm"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setAction("reject")}
                            title="Reject"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                            <XCircle className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}

            </div>

            <Modal open={action === "confirm"} onClose={() => setAction(null)} title="Confirm Appointment" size="sm">
                <div className="space-y-5">
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 p-4 space-y-1">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {appointment.patient.fullName}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {new Date(appointment.date).toLocaleDateString("en-GB", {
                                weekday: "short", day: "numeric", month: "short", year: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 p-4 flex items-start gap-3">
                        <Video className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            A video room will be created automatically and the patient will receive the link via SMS and email.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setAction(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Confirm & create room
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={action === "reject"} onClose={() => setAction(null)} title="Reject Appointment" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        The patient will be notified with your reason via SMS and email.
                    </p>
                    <div>
                        <label className={labelClass}>Reason for rejection</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Unavailable on this date, please rebook..."
                            rows={3}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setAction(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading || !rejectionReason.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Reject
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal open={action === "reschedule"} onClose={() => setAction(null)} title="Reschedule Appointment" size="sm">
                <div className="space-y-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        The patient will be notified of the new date via SMS and email.
                    </p>
                    <div>
                        <label className={labelClass}>Current date</label>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2.5">
                            {new Date(appointment.date).toLocaleDateString("en-GB", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric",
                            })}
                        </p>
                    </div>
                    <div>
                        <label className={labelClass}>New date & time</label>
                        <input
                            type="datetime-local"
                            value={rescheduledDate}
                            onChange={(e) => setRescheduledDate(e.target.value)}
                            className={inputClass}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setAction(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={loading || !rescheduledDate} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50 transition-colors">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Reschedule
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
