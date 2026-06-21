import { getResend } from "@/lib/resend"
import { prisma } from "@/lib/prisma"

export async function sendAutomationEmail(
  to: string,
  subject: string,
  body: string,
  tenantId: string
) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  const from = tenant?.slug ? `info@${tenant.slug}.com` : "noreply@bookingplatform.com"

  try {
    const result = await getResend().emails.send({
      from: `Booking Platform <${from}>`,
      to,
      subject,
      html: body,
    })
    return result
  } catch (error) {
    console.error("Email send failed:", error)
    throw error
  }
}

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: Date | null,
  tenantId: string
) {
  const subject = `Invoice ${invoiceNumber} - ${dueDate ? `Due ${dueDate.toLocaleDateString()}` : "Payment Request"}`
  const body = `
    <h2>Invoice ${invoiceNumber}</h2>
    <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
    ${dueDate ? `<p>Due Date: ${dueDate.toLocaleDateString()}</p>` : ""}
    <p>Please process payment at your earliest convenience.</p>
  `

  return sendAutomationEmail(to, subject, body, tenantId)
}

export async function sendBookingConfirmation(
  to: string,
  title: string,
  startTime: Date,
  tenantId: string
) {
  const subject = `Booking Confirmed: ${title}`
  const body = `
    <h2>Booking Confirmed</h2>
    <p><strong>${title}</strong></p>
    <p>Date: ${startTime.toLocaleDateString()}</p>
    <p>Time: ${startTime.toLocaleTimeString()}</p>
    <p>We look forward to seeing you!</p>
  `

  return sendAutomationEmail(to, subject, body, tenantId)
}

export async function sendBookingReminder(
  to: string,
  title: string,
  startTime: Date,
  tenantId: string
) {
  const subject = `Reminder: ${title} Tomorrow`
  const body = `
    <h2>Booking Reminder</h2>
    <p>This is a reminder for your upcoming appointment:</p>
    <p><strong>${title}</strong></p>
    <p>Date: ${startTime.toLocaleDateString()}</p>
    <p>Time: ${startTime.toLocaleTimeString()}</p>
  `

  return sendAutomationEmail(to, subject, body, tenantId)
}
