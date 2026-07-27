
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const prisma = new PrismaClient()

async function main() {
    console.log("Seeding demo hospital...")

    // Create hospital
    const hospital = await prisma.hospital.upsert({
        where: { slug: "demo-hospital" },
        update: {},
        create: {
            name:               "Demo Hospital",
            slug:               "demo-hospital",
            email:              "admin@demohospital.com",
            phone:              "+233 20 000 0000",
            address:            "1 Demo Street, Accra, Ghana",
            plan:               "growth",
            subscriptionStatus: "active",
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            clinics: {
                create: { name: "Demo Hospital — Main Branch", isDefault: true },
            },
        },
    })
    console.log("Hospital created:", hospital.slug)

    // Create admin
    const adminPw = await bcrypt.hash("admin123", 10)
    await prisma.staff.upsert({
        where: { id: "demo-admin-001" },
        update: {},
        create: {
            id:         "demo-admin-001",
            hospitalId: hospital.id,
            name:       "Demo Admin",
            email:      "admin@demohospital.com",
            password:   adminPw,
            role:       "hospital_admin",
        },
    })
    console.log("Admin created: admin@demohospital.com / admin123")

    // Create doctors
    const doctorPw = await bcrypt.hash("doctor123", 10)
    const doctor1 = await prisma.doctor.upsert({
        where: { id: "demo-doctor-001" },
        update: {},
        create: {
            id:         "demo-doctor-001",
            hospitalId: hospital.id,
            name:       "Dr. Kwame Mensah",
            specialty:  "General Practitioner",
            email:      "dr.mensah@demohospital.com",
            password:   doctorPw,
        },
    })
    const doctor2 = await prisma.doctor.upsert({
        where: { id: "demo-doctor-002" },
        update: {},
        create: {
            id:         "demo-doctor-002",
            hospitalId: hospital.id,
            name:       "Dr. Ama Owusu",
            specialty:  "Pediatrician",
            email:      "dr.owusu@demohospital.com",
            password:   doctorPw,
        },
    })
    console.log("Doctors created: dr.mensah@demohospital.com / doctor123")

    // Set availability for doctor1
    const days = [1, 2, 3, 4, 5] // Mon-Fri
    for (const day of days) {
        await prisma.availability.upsert({
            where: { id: `demo-avail-${doctor1.id}-${day}` },
            update: {},
            create: {
                id:               `demo-avail-${doctor1.id}-${day}`,
                doctorId:         doctor1.id,
                hospitalId:       hospital.id,
                dayOfWeek:        day,
                startTime:        "09:00",
                endTime:          "17:00",
                slotDurationMins: 30,
            },
        })
    }
    console.log("Availability set for Dr. Mensah")

    // Create staff
    const staffPw = await bcrypt.hash("staff123", 10)
    await prisma.staff.upsert({
        where: { id: "demo-nurse-001" },
        update: {},
        create: {
            id: "demo-nurse-001", hospitalId: hospital.id,
            name: "Nurse Abena", email: "nurse@demohospital.com",
            password: staffPw, role: "nurse",
        },
    })
    await prisma.staff.upsert({
        where: { id: "demo-receptionist-001" },
        update: {},
        create: {
            id: "demo-receptionist-001", hospitalId: hospital.id,
            name: "Receptionist Kofi", email: "reception@demohospital.com",
            password: staffPw, role: "receptionist",
        },
    })
    await prisma.staff.upsert({
        where: { id: "demo-pharmacist-001" },
        update: {},
        create: {
            id: "demo-pharmacist-001", hospitalId: hospital.id,
            name: "Pharmacist Yaa", email: "pharmacy@demohospital.com",
            password: staffPw, role: "pharmacist",
        },
    })
    console.log("Staff created: nurse/reception/pharmacy@demohospital.com / staff123")

    // Create demo patient
    const patient = await prisma.patient.upsert({
        where: { id: "demo-patient-001" },
        update: {},
        create: {
            id:                    "demo-patient-001",
            hospitalId:            hospital.id,
            fullName:              "Kofi Asante",
            email:                 "kofi@example.com",
            phone:                 "+233 24 000 0000",
            gender:                "Male",
            dateOfBirth:           new Date("1990-01-15"),
            address:               "45 Ring Road, Accra",
            occupation:            "Software Engineer",
            primaryPhysicianId:    doctor1.id,
            insuranceProvider:     "NHIS",
            insurancePolicyNumber: "NHIS-12345",
        },
    })
    console.log("Patient created: kofi@example.com (use OTP login)")

    // Create demo drugs
    const drugs = [
        { name: "Paracetamol", genericName: "Paracetamol 500mg", category: "Analgesics", unit: "tablet", price: 0.50 },
        { name: "Amoxil", genericName: "Amoxicillin 500mg", category: "Antibiotics", unit: "capsule", price: 3.50 },
        { name: "Coartem", genericName: "Artemether/Lumefantrine", category: "Antimalarials", unit: "tablet", price: 25.00 },
        { name: "Metformin", genericName: "Metformin 500mg", category: "Antidiabetics", unit: "tablet", price: 1.50 },
        { name: "Amlodipine", genericName: "Amlodipine 5mg", category: "Antihypertensives", unit: "tablet", price: 2.00 },
        { name: "Vitamin C", genericName: "Ascorbic Acid 500mg", category: "Vitamins & Supplements", unit: "tablet", price: 0.50 },
        { name: "ORS", genericName: "Oral Rehydration Salts", category: "Gastrointestinal", unit: "sachet", price: 1.00 },
        { name: "Ibuprofen", genericName: "Ibuprofen 400mg", category: "Analgesics", unit: "tablet", price: 1.00 },
    ]
    for (const drug of drugs) {
        await prisma.drug.upsert({
            where: { id: `demo-drug-${drug.name.toLowerCase().replace(/\s/g, "-")}` },
            update: {},
            create: { id: `demo-drug-${drug.name.toLowerCase().replace(/\s/g, "-")}`, hospitalId: hospital.id, ...drug },
        })
    }
    console.log("Demo drugs seeded")

    console.log("\n=== DEMO CREDENTIALS ===")
    console.log("URL prefix: /demo-hospital/")
    console.log("Admin:        admin@demohospital.com / admin123")
    console.log("Doctor 1:     dr.mensah@demohospital.com / doctor123")
    console.log("Doctor 2:     dr.owusu@demohospital.com / doctor123")
    console.log("Nurse:        nurse@demohospital.com / staff123")
    console.log("Receptionist: reception@demohospital.com / staff123")
    console.log("Pharmacist:   pharmacy@demohospital.com / staff123")
    console.log("Patient:      kofi@example.com (OTP login)")
    console.log("========================\n")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
