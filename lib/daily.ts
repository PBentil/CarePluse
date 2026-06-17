const DAILY_API_KEY = process.env.DAILY_API_KEY!

export async function createVideoRoom(appointmentId: string): Promise<{ url: string; name: string }> {
    const roomName = `carepulse-${appointmentId}`

    const res = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
            name:    roomName,
            privacy: "private",
            properties: {
                enable_chat:        true,
                enable_screenshare: true,
                start_video_off:    false,
                start_audio_off:    false,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            },
        }),
    })

    if (!res.ok) {
        const error = await res.json()
        // Room already exists — fetch it instead
        if (error.error === "invalid-request-error" && error.info?.includes("already exists")) {
            const existing = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
                headers: { "Authorization": `Bearer ${DAILY_API_KEY}` },
            })
            const existingData = await existing.json()
            return { url: existingData.url, name: existingData.name }
        }
        console.error("Daily.co error:", error)
        throw new Error(error.info || error.error || "Failed to create video room")
    }

    const data = await res.json()
    console.log("Daily.co room created:", data.name, data.url)
    return { url: data.url, name: data.name }
}

export async function deleteVideoRoom(roomName: string): Promise<void> {
    await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${DAILY_API_KEY}` },
    })
}