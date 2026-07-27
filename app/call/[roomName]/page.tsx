
"use client"

import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        JitsiMeetExternalAPI: new (domain: string, options: object) => {
            dispose: () => void
        }
    }
}

export default function CallPage() {
    const { roomName } = useParams<{ roomName: string }>()
    const containerRef  = useRef<HTMLDivElement>(null)
    const apiRef        = useRef<{ dispose: () => void } | null>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const script = document.createElement("script")
        script.src   = "https://meet.jit.si/external_api.js"
        script.async = true
        script.onload = () => {
            if (!containerRef.current) return
            apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
                roomName,
                parentNode: containerRef.current,
                width:      "100%",
                height:     "100%",
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled:  false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK:       false,
                    SHOW_WATERMARK_FOR_GUESTS:  false,
                    SHOW_BRAND_WATERMARK:       false,
                    TOOLBAR_BUTTONS: [
                        "microphone", "camera", "closedcaptions",
                        "desktop", "fullscreen", "fodeviceselection",
                        "hangup", "chat", "raisehand", "tileview",
                    ],
                },
            })
        }
        document.head.appendChild(script)

        return () => {
            apiRef.current?.dispose()
            document.head.removeChild(script)
        }
    }, [roomName])

    return (
        <div className="h-screen w-screen bg-zinc-900 flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-950 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <span className="text-white text-sm font-medium">CarePulse Video</span>
                </div>
                <span className="text-zinc-400 text-xs font-mono">{roomName}</span>
            </div>
            <div ref={containerRef} className="flex-1" />
        </div>
    )
}
