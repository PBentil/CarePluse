export async function getDoctors() {
    const res = await fetch("/api/admin/doctors?limit=100", { cache: "no-store" })
    const data = await res.json()
    return data.doctors as { id: string; name: string; specialty: string }[]
}