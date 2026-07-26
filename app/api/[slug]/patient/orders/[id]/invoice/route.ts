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

        const order = await prisma.order.findFirst({
            where: { id, patientId: patient.id },
            include: {
                patient: { select: { fullName: true, email: true, phone: true, address: true } },
                prescription: {
                    include: {
                        items:  true,
                        doctor: { select: { name: true, specialty: true } },
                    },
                },
                hospital: { select: { name: true, email: true, phone: true, address: true } },
            },
        })

        if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

        const date = new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric",
        })

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt — CarePulse</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; color: #18181b; font-size: 13px; padding: 0 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #18181b; }
  .brand { font-size: 20px; font-weight: 700; }
  .brand span { color: #2563eb; }
  .receipt-no { font-size: 12px; color: #71717a; margin-top: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .info-block p { margin: 3px 0; color: #71717a; font-size: 12px; }
  .info-block strong { color: #18181b; font-size: 13px; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
  td { padding: 10px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; }
  .total-section { border-top: 2px solid #18181b; padding-top: 12px; display: flex; justify-content: space-between; }
  .total-section .label { font-weight: 700; font-size: 14px; }
  .total-section .amount { font-weight: 700; font-size: 18px; color: #18181b; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #f0fdf4; color: #16a34a; margin-top: 16px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; color: #71717a; font-size: 11px; text-align: center; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Care<span>Pulse</span></div>
      <div class="receipt-no">Receipt #${order.id.slice(0, 8).toUpperCase()}</div>
      <div class="receipt-no">${date}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-weight:600;font-size:14px;">${order.hospital.name}</div>
      <div style="color:#71717a;font-size:12px;">${order.hospital.email}</div>
      <div style="color:#71717a;font-size:12px;">${order.hospital.phone}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <p class="section-title">Bill to</p>
      <strong>${order.patient.fullName}</strong>
      <p>${order.patient.phone}</p>
      <p>${order.patient.email}</p>
    </div>
    <div class="info-block">
      <p class="section-title">Delivery</p>
      <p>${order.deliveryAddress}</p>
      <p style="margin-top:8px;"><strong>Status:</strong> ${order.status.replace("_", " ")}</p>
      ${order.paystackRef ? `<p><strong>Ref:</strong> ${order.paystackRef}</p>` : ""}
    </div>
  </div>

  <p class="section-title">Prescribed by Dr. ${order.prescription?.doctor.name ?? ""}</p>

  <table>
    <thead>
      <tr>
        <th style="width:40%">Item</th>
        <th>Dosage</th>
        <th>Duration</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.prescription?.items.map(item => `
        <tr>
          <td><strong>${item.drugName}</strong></td>
          <td>${item.dosage}</td>
          <td>${item.duration}</td>
          <td style="text-align:right">GH₵ ${item.price.toFixed(2)}</td>
        </tr>
      `).join("") ?? ""}
    </tbody>
  </table>

  <div class="total-section">
    <span class="label">Total paid</span>
    <span class="amount">GH₵ ${order.totalAmount.toFixed(2)}</span>
  </div>

  <div style="text-align:center;">
    <span class="status-badge">PAID ✓</span>
  </div>

  <div class="footer">
    <p>Thank you for using CarePulse. Keep this receipt for your records.</p>
    <p style="margin-top:4px;">CarePulse — Powered by modern healthcare technology.</p>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

        return new NextResponse(html, {
            headers: {
                "Content-Type":        "text/html",
                "Content-Disposition": `inline; filename="receipt-${order.id.slice(0, 8)}.html"`,
            },
        })
    } catch (error: unknown) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 })
    }
}
