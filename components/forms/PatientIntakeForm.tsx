"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { patientIntakeSchema } from "@/lib/validation"
import { CustomFormField } from "../customFormField"
import { SubmitButton } from "../submitButton"
import { toast } from "sonner"

const doctors = [
  "Dr. Kwame Mensah",
  "Dr. Akua Owusu",
  "Dr. John Doe",
  "Dr. Jane Smith",
]

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

export default function PatientIntakeForm({
  patientId,
  defaultValues,
}: PatientIntakeFormProps) {

  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm({
    resolver: zodResolver(patientIntakeSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    }
  })
  
   

  const onSubmit = async (data: any) => {
    try {

      if (!patientId) {
        toast.error("Patient ID missing")
        return
      }
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        toast.error("Failed to save medical information")
        return
      }

      toast.success("Medical information saved successfully")

    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-card p-6 rounded-lg space-y-6 shadow">
        <h2 className="text-xl font-semibold text-primary">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <CustomFormField
            label="Full Name"
            name="fullName"
            register={register}
            readOnly
          />

          <CustomFormField
            label="Email Address"
            name="email"
            type="email"
            register={register}
            readOnly
          />

          <CustomFormField
            label="Phone Number"
            name="phone"
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

          {/* Gender */}

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Gender</label>

            <select
              {...register("gender")}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Gender</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender.message}</p>
            )}
          </div>

          <CustomFormField
            label="Address"
            name="address"
            register={register}
            error={errors.address?.message}
          />

          <CustomFormField
            label="Occupation"
            name="occupation"
            register={register}
            error={errors.occupation?.message}
          />

          <CustomFormField
            label="Emergency Contact Name"
            name="emergencyContactName"
            register={register}
            error={errors.emergencyContactName?.message}
          />

          <CustomFormField
            label="Emergency Contact Number"
            name="emergencyContactNumber"
            register={register}
            error={errors.emergencyContactNumber?.message}
          />

        </div>
      </div>

      {/* MEDICAL INFORMATION */}

      <div className="bg-card p-6 rounded-lg space-y-6 shadow">

        <h2 className="text-xl font-semibold text-primary">Medical Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col">

            <label className="mb-1 font-medium">
              Primary Care Physician
            </label>

            <select
              {...register("primaryCarePhysician")}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Doctor</option>

              {doctors.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}

            </select>

            {errors.primaryCarePhysician && (
              <p className="text-red-500 text-sm">
                {errors.primaryCarePhysician.message}
              </p>
            )}

          </div>

          <CustomFormField
            label="Insurance Provider"
            name="insuranceProvider"
            register={register}
            error={errors.insuranceProvider?.message}
          />

          <CustomFormField
            label="Insurance Policy Number"
            name="insurancePolicyNumber"
            register={register}
            error={errors.insurancePolicyNumber?.message}
          />

          <CustomFormField
            label="Allergies"
            name="allergies"
            register={register}
            error={errors.allergies?.message}
          />

          <CustomFormField
            label="Current Medication"
            name="currentMedication"
            register={register}
            error={errors.currentMedication?.message}
          />

        </div>
      </div>

      {/* IDENTIFICATION */}

      <div className="bg-card p-6 rounded-lg space-y-6 shadow">

        <h2 className="text-xl font-semibold text-primary">
          Identification & Verification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex flex-col">

            <label className="mb-1 font-medium">
              Identification Type
            </label>

            <select
              {...register("identificationType")}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select ID Type</option>

              {idTypes.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}

            </select>

            {errors.identificationType && (
              <p className="text-red-500 text-sm">
                {errors.identificationType.message}
              </p>
            )}

          </div>

          <CustomFormField
            label="Identification Number"
            name="identificationNumber"
            register={register}
            error={errors.identificationNumber?.message}
          />

        </div>
      </div>

      {/* CONSENT */}

      <div className="bg-card p-6 rounded-lg space-y-4 shadow">

        <h2 className="text-xl font-semibold text-primary">
          Consent & Privacy
        </h2>

        <div className="space-y-3 text-sm">

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("treatmentConsent")} />
            I consent to receive treatment
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("disclosureConsent")} />
            I agree to disclosure of medical information
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("privacyPolicy")} />
            I agree to the privacy policy
          </label>

        </div>

      </div>

      <SubmitButton isLoading={isSubmitting}>
        Submit Medical Information
      </SubmitButton>

    </form>
  )
}
