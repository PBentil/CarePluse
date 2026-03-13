"use client"

import { FieldValues, Path, UseFormRegister, Controller, Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface CustomFormFieldProps<T extends FieldValues> {
  label: string
  name: Path<T>
  register?: UseFormRegister<T>
  control?: Control<T>
  type?: string
  placeholder?: string
  error?: string
  textarea?: boolean
  phone?: boolean
  disabled?: boolean      
  readOnly?: boolean     
  countries?: { code: string; label: string; dialCode: string }[]
}


export function CustomFormField<T extends FieldValues>({
  label,
  name,
  register,
  control,
  type = "text",
  placeholder,
  error,
  textarea = false,
  phone = false,
  disabled=false,
  readOnly=false,
  countries = [
    { code: "US", label: "United States", dialCode: "+1" },
    { code: "GB", label: "United Kingdom", dialCode: "+44" },
    { code: "GH", label: "Ghana", dialCode: "+233" },
    { code: "NG", label: "Nigeria", dialCode: "+234" },
  ],
}: CustomFormFieldProps<T>) {
  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={name.toString()}>{label}</Label>

      {phone && control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="flex gap-2">
              <Select
                value={field.value?.split(" ")[0] || countries[0].dialCode}
                onValueChange={(val) =>
                  field.onChange(`${val} ${field.value?.split(" ")[1] || ""}`)
                }
              >
                <SelectTrigger className="w-30">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.dialCode}>
                      {c.label} ({c.dialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="tel"
                placeholder={placeholder}
                value={field.value?.split(" ")[1] || ""}
                onChange={(e) =>
                  field.onChange(
                    `${field.value?.split(" ")[0] || countries[0].dialCode} ${e.target.value}`
                  )
                }
              />
            </div>
          )}
        />
      ) : textarea ? (
        <textarea
          id={name.toString()}
          placeholder={placeholder}
          {...register!(name)}
          className={`rounded-md border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? "border-destructive" : "border-border"
          }`}
          rows={4}
          disabled={disabled}     
  readOnly={readOnly}
        />
      ) : (
        <Input
          id={name.toString()}
          type={type}
          placeholder={placeholder}
          {...register!(name)}
          className={error ? "border-destructive" : "border-border"}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}