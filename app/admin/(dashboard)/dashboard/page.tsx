"use client"

import { useEffect, useState } from "react"
import { Users, Calendar, Stethoscope } from "lucide-react"
import { Column, DataTable } from "@/components/admin/data-table"
import type { Patient } from "@/types"

const patientColumns: Column<Patient>[] = [
    {
        header: "Name",
        accessor: (row) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0">
                    {row.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-zinc-900 dark:text-white">{row.fullName}</span>
            </div>
        ),
    },
    { header: "Email",  accessor: "email" },
    { header: "Phone",  accessor: "phone" },
    {
        header: "Gender",
        accessor: (row) =>
            row.gender ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {row.gender}
                </span>
            ) : (
                <span className="text-zinc-300 dark:text-zinc-600">—</span>
            ),
    },
    {
        header: "Registered",
        accessor: (row) =>
            new Date(row.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
            }),
    },
]

const statCards = [
    { label: "Total patients",    key: "patients",     icon: Users },
    { label: "Appointments",      key: "appointments", icon: Calendar },
    { label: "Doctors on roster", key: "doctors",      icon: Stethoscope },
]

export default function AdminDashboard() {
    const [statsData, setStatsData]         = useState({ patients: 0, appointments: 0, doctors: 0 })
    const [patients, setPatients]           = useState<Patient[]>([])
    const [loadingStats, setLoadingStats]   = useState(true)
    const [loadingPatients, setLoadingPatients] = useState(true)

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then(r => r.json())
            .then(data => { setStatsData(data); setLoadingStats(false) })

        fetch("/api/admin/patients")
            .then(r => r.json())
            .then(d => { setPatients(d.patients); setLoadingPatients(false) })
    }, [])

    return (
        <div className="space-y-8">

            <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Dashboard</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Overview of patients, appointments and doctors.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {statCards.map(({ label, key, icon: Icon }) => (
                    <div
                        key={key}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 flex items-center justify-between"
                    >
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                                {label}
                            </p>
                            <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
                                {loadingStats ? "—" : statsData[key as keyof typeof statsData]}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                        </div>
                    </div>
                ))}
            </div>

            <DataTable
                data={patients}
                columns={patientColumns}
                loading={loadingPatients}
                searchKeys={["fullName", "email"]}
                searchPlaceholder="Search patients..."
                title="Recent patients"
                emptyMessage="No patients registered yet"
            />

        </div>
    )
}