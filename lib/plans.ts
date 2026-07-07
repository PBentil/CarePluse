
export const PLANS = {
    starter: {
        name:       "Starter",
        price:      500,
        currency:   "GHS",
        maxClinics: 1,
        maxDoctors: 5,
        features:   ["1 clinic", "Up to 5 doctors", "Appointments", "Basic reports"],
    },
    growth: {
        name:       "Growth",
        price:      1500,
        currency:   "GHS",
        maxClinics: 5,
        maxDoctors: 25,
        features:   ["5 clinics", "Up to 25 doctors", "All features", "Priority support"],
    },
    enterprise: {
        name:       "Enterprise",
        price:      4000,
        currency:   "GHS",
        maxClinics: -1,
        maxDoctors: -1,
        features:   ["Unlimited clinics", "Unlimited doctors", "All features", "Dedicated support"],
    },
} as const

export type PlanKey = keyof typeof PLANS
