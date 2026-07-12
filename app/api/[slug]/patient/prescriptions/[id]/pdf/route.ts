import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPatientFromRequest } from "@/lib/auth"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; id: string }> }
) {
    try {
        const { slug, id } = await params
        const patient      = await getPatientFromRequest(req, slug)
        if (!patient) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

        const prescription = await prisma.prescription.findFirst({
            where: { id, patientId: patient.id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true } },
                doctor:  { select: { name: true, specialty: true } },
                items:   true,
            },
        })

        if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const total = prescription.items.reduce((s, i) => s + i.price, 0)
        const date  = new Date(prescription.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric",
        })

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Prescription — CarePulse</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #18181b; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #18181b; padding-bottom: 16px; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand span { color: #2563eb; }
  .rx { font-size: 32px; font-weight: 700; color: #d1d5db; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .info-block p { margin: 2px 0; }
  .info-label { color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
  td { padding: 10px 0; border-bottom: 1px solid #f4f4f5; vertical-align: top; }
  .total-row td { border-bottom: none; font-weight: 700; padding-top: 16px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; color: #71717a; font-size: 11px; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #f0fdf4; color: #16a34a; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Care<span>Pulse</span></div>
      <p style="color:#71717a;margin:4px 0 0;">Digital Prescription</p>
    </div>
    <div class="rx">Rx</div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <p class="info-label">Patient</p>
      <p><strong>${prescription.patient.fullName}</strong></p>
      <p style="color:#71717a">${prescription.patient.phone}</p>
      <p style="color:#71717a">${prescription.patient.email}</p>
    </div>
    <div class="info-block">
      <p class="info-label">Prescribed by</p>
      <p><strong>Dr. ${prescription.doctor.name}</strong></p>
      <p style="color:#71717a">${prescription.doctor.specialty ?? ""}</p>
      <p style="color:#71717a">Date: ${date}</p>
    </div>
  </div>

  ${prescription.diagnosis ? `<div style="background:#f4f4f5;border-radius:8px;padding:12px;margin-bottom:24px;"><p class="info-label">Diagnosis</p><p style="margin:4px 0 0;">${prescription.diagnosis}</p></div>` : ""}

  <table>
    <thead>
      <tr>
        <th style="width:35%">Drug</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th style="text-align:right">Price</th>
      </tr>
    </thead>
    <tbody>
      ${prescription.items.map(item => `
        <tr>
          <td><strong>${item.drugName}</strong>${item.notes ? `<br><span style="color:#71717a;font-size:11px;">${item.notes}</span>` : ""}</td>
          <td>${item.dosage}</td>
          <td>${item.frequency}</td>
          <td>${item.duration}</td>
          <td style="text-align:right">GH₵ ${item.price.toFixed(2)}</td>
        </tr>
      `).join("")}
      <tr class="total-row">
        <td colspan="4">Total</td>
        <td style="text-align:right">GH₵ ${total.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  ${prescription.notes ? `<div style="margin-bottom:24px;"><p class="info-label">Notes</p><p style="margin:4px 0 0;color:#71717a;">${prescription.notes}</p></div>` : ""}

  <div style="text-align:center;margin:24px 0;">
    <span class="status">${prescription.status.toUpperCase()}</span>
  </div>

  <div class="footer">
    <p>This is a digital prescription issued via CarePulse. Ref: ${prescription.id.slice(0, 8).toUpperCase()}</p>
    <p>Issued on ${date} · Valid for dispensing at authorised pharmacies only.</p>
  </div>
</body>
</html>`

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `inline; filename="prescription-${prescription.id.slice(0, 8)}.html"`,
            },
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
