"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast, Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CustomFormField } from "@/components/customFormField"
import { SubmitButton } from "@/components/submitButton"
import { Logo } from "@/components/logo"
import { Stethoscope } from "lucide-react"

const formSchema = z.object({
    email:    z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormType = z.infer<typeof formSchema>

export default function DoctorLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormType>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: LoginFormType) => {
        try {
            setLoading(true)

            const response = await fetch("/api/doctor/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || "Login failed")

            toast.success(`Welcome back, ${result.doctor.name}`)
            router.push("/doctor/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toaster />

            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">

                <header className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Logo />
                </header>

                <div className="flex flex-1 items-center justify-center px-4">
                    <div className="w-full max-w-sm space-y-6">
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-primary dark:bg-white flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-white dark:text-zinc-900" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-primary dark:text-white">
                                    Doctor Portal
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Sign in to manage your appointments
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                <CustomFormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="dr.mensah@carepulse.com"
                                    register={register}
                                    error={errors.email?.message}
                                />

                                <CustomFormField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    register={register}
                                    error={errors.password?.message}
                                />

                                <div className="pt-1">
                                    <SubmitButton isLoading={loading} loadingText="Signing in...">
                                        Sign In
                                    </SubmitButton>
                                </div>

                            </form>
                        </div>

                        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
                            Restricted access — authorised personnel only.
                        </p>

                    </div>
                </div>

                <footer className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    © {new Date().getFullYear()} CarePulse
                </footer>

            </div>
        </>
    )
}