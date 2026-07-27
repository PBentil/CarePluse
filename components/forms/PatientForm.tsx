"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CustomFormField } from "../customFormField"
import { SubmitButton } from "../submitButton"
import { toast, Toaster } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Phone number must be at least 7 digits"),
})

type PatientFormType = z.infer<typeof formSchema>

export default function PatientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PatientFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", phone: "+233 " },
  })

  const onSubmit = async (data: PatientFormType) => {
    try {
      setLoading(true)

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create patient")

      const result = await response.json()

      toast.success(`Welcome, ${data.fullName}!`)
      reset()

      router.push(
        `/patients/${result.id}/intake?fullName=${data.fullName}&email=${data.email}&phone=${data.phone}`
      )
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <CustomFormField
          label="Full Name"
          name="fullName"
          placeholder="Kofi Mensah"
          register={register}
          error={errors.fullName?.message}
        />

        <CustomFormField
          label="Email"
          name="email"
          type="email"
          placeholder="kofi@example.com"
          register={register}
          error={errors.email?.message}
        />

        <CustomFormField
          label="Phone Number"
          name="phone"
          phone
          control={control}
          error={errors.phone?.message}
        />

        <SubmitButton isLoading={loading}>
          Get Started
        </SubmitButton>

      </form>
    </>
  )
}