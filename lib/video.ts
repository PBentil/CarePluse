
export function createVideoRoom(appointmentId: string): { url: string; name: string } {
    const name = `carepulse-${appointmentId.slice(0, 8)}`
    const url  = `https://meet.jit.si/${name}`
    return { url, name }
}
