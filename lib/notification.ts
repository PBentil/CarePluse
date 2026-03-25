import twilio from "twilio"
import nodemailer from "nodemailer"

// ── Twilio SMS ──────────────────────────────────────────────
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
)

export async function sendSMS(to: string, message: string) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to,
        })
    } catch (error) {
        console.error("SMS error:", error)
    }
}

// ── Nodemailer Email ────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
})

export async function sendEmail({
                                    to, subject, html,
                                }: {
    to: string
    subject: string
    html: string
}) {
    try {
        await transporter.sendMail({
            from: `"CarePulse" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        })
    } catch (error) {
        console.error("Email error:", error)
    }
}

// ── Notification templates ──────────────────────────────────
export function appointmentConfirmedTemplate(data: {
    patientName: string
    doctorName: string
    date: string
}) {
    return {
        sms: `Hi ${data.patientName}, your appointment with ${data.doctorName} on ${data.date} has been confirmed. – CarePulse`,
        email: {
            subject: "Appointment Confirmed – CarePulse",
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#18181b;font-size:18px;">Appointment Confirmed ✓</h2>
          <p style="color:#71717a;">Hi <strong>${data.patientName}</strong>,</p>
          <p style="color:#71717a;">Your appointment has been confirmed with the following details:</p>
          <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;color:#18181b;"><strong>Doctor:</strong> ${data.doctorName}</p>
            <p style="margin:4px 0;color:#18181b;"><strong>Date:</strong> ${data.date}</p>
          </div>
          <p style="color:#71717a;font-size:13px;">Please arrive 10 minutes before your scheduled time.</p>
          <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
        </div>
      `,
        },
    }
}

export function appointmentRejectedTemplate(data: {
    patientName: string
    doctorName: string
    reason: string
}) {
    return {
        sms: `Hi ${data.patientName}, unfortunately your appointment with ${data.doctorName} was not approved. Reason: ${data.reason}. Please book a new time. – CarePulse`,
        email: {
            subject: "Appointment Update – CarePulse",
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#18181b;font-size:18px;">Appointment Not Approved</h2>
          <p style="color:#71717a;">Hi <strong>${data.patientName}</strong>,</p>
          <p style="color:#71717a;">We're sorry, your appointment request with <strong>${data.doctorName}</strong> could not be approved.</p>
          <div style="background:#fef2f2;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #ef4444;">
            <p style="margin:0;color:#b91c1c;"><strong>Reason:</strong> ${data.reason}</p>
          </div>
          <p style="color:#71717a;">Please log in to CarePulse to book a new appointment.</p>
          <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
        </div>
      `,
        },
    }
}

export function appointmentRescheduledTemplate(data: {
    patientName: string
    doctorName: string
    oldDate: string
    newDate: string
}) {
    return {
        sms: `Hi ${data.patientName}, your appointment with ${data.doctorName} has been rescheduled from ${data.oldDate} to ${data.newDate}. – CarePulse`,
        email: {
            subject: "Appointment Rescheduled – CarePulse",
            html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#18181b;font-size:18px;">Appointment Rescheduled</h2>
          <p style="color:#71717a;">Hi <strong>${data.patientName}</strong>,</p>
          <p style="color:#71717a;">Your appointment has been rescheduled:</p>
          <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;color:#71717a;text-decoration:line-through;">Previous: ${data.oldDate}</p>
            <p style="margin:4px 0;color:#18181b;"><strong>New date: ${data.newDate}</strong></p>
            <p style="margin:4px 0;color:#18181b;"><strong>Doctor: ${data.doctorName}</strong></p>
          </div>
          <p style="color:#a1a1aa;font-size:12px;margin-top:32px;">CarePulse – Your health, our priority.</p>
        </div>
      `,
        },
    }
}