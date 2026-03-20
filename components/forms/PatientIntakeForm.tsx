"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientIntakeSchema } from "@/lib/validation"
import { CustomFormField } from "../customFormField"
import { SubmitButton } from "../submitButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { User, Heart, CreditCard, ShieldCheck } from "lucide-react"
import {useEffect, useState} from "react";


const idTypes = ["Ghana Card", "Health Insurance", "Passport", "Driver's License"]
const genders = ["Male", "Female", "Other"]

interface PatientIntakeFormProps {
  patientId: string
  defaultValues?: {
    fullName?: string
    email?: string
    phone?: string
  }
}

const SectionCard = ({
                       icon: Icon,
                       title,
                       children,
                     }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) => (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>
        <h2 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
      {children}
    </label>
)

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null

const selectClass =
    "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent transition-all appearance-none"

export default function PatientIntakeForm({
                                            patientId,
                                            defaultValues,
                                          }: PatientIntakeFormProps) {
  const router = useRouter()
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientIntakeSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    },
  })

  const onSubmit = async (data: any) => {
    try {
      if (!patientId) {
        toast.error("Patient ID missing")
        return
      }
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        toast.error("Failed to save medical information")
        return
      }

      toast.success("Medical information saved successfully")
      reset()
      router.push(`/success`)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }


  useEffect(() => {
    fetch("/api/admin/doctors?limit=100")
        .then((r) => r.json())
        .then((d) => setDoctors(d.doctors ?? []))
  }, [])

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Personal Information */}
        <SectionCard icon={User} title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomFormField
                label="Full Name"
                name="fullName"
                placeholder="Kofi Mensah"
                register={register}
                readOnly
            />
            <CustomFormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="kofi@example.com"
                register={register}
                readOnly
            />
            <CustomFormField
                label="Phone Number"
                name="phone"
                placeholder="+233 ..."
                register={register}
                readOnly
            />
            <CustomFormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                register={register}
                error={errors.dateOfBirth?.message}
            />

            <div>
              <FieldLabel>Gender</FieldLabel>
              <select {...register("gender")} className={selectClass}>
                <option value="">Select gender</option>
                {genders.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <FieldError message={errors.gender?.message} />
            </div>

            <CustomFormField
                label="Address"
                name="address"
                placeholder="123 Liberation Rd, Accra"
                register={register}
                error={errors.address?.message}
            />
            <CustomFormField
                label="Occupation"
                name="occupation"
                placeholder="e.g. Software Engineer"
                register={register}
                error={errors.occupation?.message}
            />
            <CustomFormField
                label="Emergency Contact Name"
                name="emergencyContactName"
                placeholder="John Mensah"
                register={register}
                error={errors.emergencyContactName?.message}
            />
            <CustomFormField
                label="Emergency Contact Number"
                name="emergencyContactNumber"
                placeholder="+233 ..."
                register={register}
                error={errors.emergencyContactNumber?.message}
            />
          </div>
        </SectionCard>

        {/* Medical Information */}
        <SectionCard icon={Heart} title="Medical Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Primary Care Physician</FieldLabel>
              <select {...register("primaryCarePhysician")} className={selectClass}>
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}

              </select>
              <FieldError message={errors.primaryCarePhysician?.message} />
            </div>

            <CustomFormField
                label="Insurance Provider"
                name="insuranceProvider"
                placeholder="e.g. NHIS, Acacia Health"
                register={register}
                error={errors.insuranceProvider?.message}
            />
            <CustomFormField
                label="Insurance Policy Number"
                name="insurancePolicyNumber"
                placeholder="e.g. POL-0012345"
                register={register}
                error={errors.insurancePolicyNumber?.message}
            />
            <CustomFormField
                label="Allergies"
                name="allergies"
                placeholder="e.g. Penicillin, Peanuts"
                register={register}
                error={errors.allergies?.message}
            />
            <CustomFormField
                label="Current Medication"
                name="currentMedication"
                placeholder="e.g. Paracetamol 500mg"
                register={register}
                error={errors.currentMedication?.message}
            />
          </div>
        </SectionCard>

        <SectionCard icon={CreditCard} title="Identification & Verification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Identification Type</FieldLabel>
              <select {...register("identificationType")} className={selectClass}>
                <option value="">Select ID type</option>
                {idTypes.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <FieldError message={errors.identificationType?.message} />
            </div>

            <CustomFormField
                label="Identification Number"
                name="identificationNumber"
                placeholder="GHA-XXXXXXXXX-X"
                register={register}
                error={errors.identificationNumber?.message}
            />
          </div>
        </SectionCard>

        <SectionCard icon={ShieldCheck} title="Consent & Privacy">
          <div className="space-y-4">
            {[
              { name: "treatmentConsent",  label: "I consent to receive treatment for my health condition." },
              { name: "disclosureConsent", label: "I agree to the disclosure of my medical information as necessary." },
              { name: "privacyPolicy",     label: "I have read and agree to the privacy policy." },
            ].map(({ name, label }) => (
                <label key={name} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                        type="checkbox"
                        {...register(name as any)}
                        className="peer h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 appearance-none bg-white dark:bg-zinc-800 border checked:bg-zinc-900 dark:checked:bg-white checked:border-zinc-900 dark:checked:border-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-1"
                    />
                    <svg
                        className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white dark:text-zinc-900"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                      <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {label}
              </span>
                </label>
            ))}

            {(errors.treatmentConsent || errors.disclosureConsent || errors.privacyPolicy) && (
                <p className="text-xs text-red-500">Please accept all consents to continue.</p>
            )}
          </div>
        </SectionCard>

        <SubmitButton isLoading={isSubmitting}>
          Submit Medical Information
        </SubmitButton>

      </form>
  )
}