
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientIntakeSchema } from "@/lib/validation"
import type * as z from "zod"
import { CustomFormField } from "../customFormField"
import { SubmitButton } from "../submitButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { User, Heart, CreditCard, ShieldCheck, Upload, X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { uploadFile } from "@/lib/cloudinary"

type FormValues = z.infer<typeof patientIntakeSchema>

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
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [doctors, setDoctors]       = useState<{ id: string; name: string }[]>([])
  const [idFile, setIdFile]         = useState<File | null>(null)
  const [uploading, setUploading]   = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(patientIntakeSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      email:    defaultValues?.email    || "",
      phone:    defaultValues?.phone    || "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (!patientId) {
        toast.error("Patient ID missing")
        return
      }

      let identificationDocumentUrl: string | undefined

      if (idFile) {
        setUploading(true)
        try {
          const formData = new FormData()
          formData.append("file", idFile)
          formData.append("folder", "carepulse/id-documents")
          formData.append("patientId", patientId)

          const uploadRes = await fetch("/api/patients/upload-id", {
            method: "POST",
            body:   formData,
          })

          const uploadData = await uploadRes.json()
          if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")
          identificationDocumentUrl = uploadData.url
        } finally {
          setUploading(false)
        }
      }

      const response = await fetch(`/api/patients/${patientId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...data, identificationDocumentUrl }),
      })

      if (!response.ok) {
        toast.error("Failed to save medical information")
        return
      }

      toast.success("Medical information saved successfully")
      reset()
      router.push(`/success?patientId=${patientId}&fullName=${encodeURIComponent(data.fullName)}`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    }
  }

  useEffect(() => {
    fetch("/api/admin/doctors?limit=100")
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors ?? []))
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <SectionCard icon={User} title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField label="Full Name" name="fullName" placeholder="Kofi Mensah" register={register} readOnly />
          <CustomFormField label="Email Address" name="email" type="email" placeholder="kofi@example.com" register={register} readOnly />
          <CustomFormField label="Phone Number" name="phone" placeholder="+233 ..." register={register} readOnly />
          <CustomFormField label="Date of Birth" name="dateOfBirth" type="date" register={register} error={errors.dateOfBirth?.message} />

          <div>
            <FieldLabel>Gender</FieldLabel>
            <select {...register("gender")} className={selectClass}>
              <option value="">Select gender</option>
              {genders.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <FieldError message={errors.gender?.message} />
          </div>

          <CustomFormField label="Address" name="address" placeholder="123 Liberation Rd, Accra" register={register} error={errors.address?.message} />
          <CustomFormField label="Occupation" name="occupation" placeholder="e.g. Software Engineer" register={register} error={errors.occupation?.message} />
          <CustomFormField label="Emergency Contact Name" name="emergencyContactName" placeholder="John Mensah" register={register} error={errors.emergencyContactName?.message} />
          <CustomFormField label="Emergency Contact Number" name="emergencyContactNumber" placeholder="+233 ..." register={register} error={errors.emergencyContactNumber?.message} />
        </div>
      </SectionCard>

      <SectionCard icon={Heart} title="Medical Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Primary Care Physician</FieldLabel>
            <select {...register("primaryPhysicianId")} className={selectClass}>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FieldError message={errors.primaryPhysicianId?.message} />
          </div>
          <CustomFormField label="Insurance Provider" name="insuranceProvider" placeholder="e.g. NHIS, Acacia Health" register={register} error={errors.insuranceProvider?.message} />
          <CustomFormField label="Insurance Policy Number" name="insurancePolicyNumber" placeholder="e.g. POL-0012345" register={register} error={errors.insurancePolicyNumber?.message} />
          <CustomFormField label="Allergies" name="allergies" placeholder="e.g. Penicillin, Peanuts" register={register} error={errors.allergies?.message} />
          <CustomFormField label="Current Medication" name="currentMedication" placeholder="e.g. Paracetamol 500mg" register={register} error={errors.currentMedication?.message} />
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

          <CustomFormField label="Identification Number" name="identificationNumber" placeholder="GHA-XXXXXXXXX-X" register={register} error={errors.identificationNumber?.message} />

          <div className="md:col-span-2">
            <FieldLabel>ID Document (photo or scan)</FieldLabel>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                idFile
                  ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => setIdFile(e.target.files?.[0] ?? null)}
              />
              {idFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{idFile.name}</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setIdFile(null) }}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="h-6 w-6 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-400">Click to upload your ID document</p>
                  <p className="text-xs text-zinc-300">PDF, JPG or PNG · Max 10MB</p>
                </div>
              )}
            </div>
          </div>
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
                  {...register(name as "treatmentConsent" | "disclosureConsent" | "privacyPolicy")}
                  className="peer h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 appearance-none bg-white dark:bg-zinc-800 border checked:bg-zinc-900 dark:checked:bg-white checked:border-zinc-900 dark:checked:border-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white focus:ring-offset-1"
                />
                <svg className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-white dark:text-zinc-900" viewBox="0 0 16 16" fill="none">
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

      <SubmitButton isLoading={isSubmitting || uploading} loadingText={uploading ? "Uploading ID..." : "Saving..."}>
        Submit Medical Information
      </SubmitButton>

    </form>
  )
}
