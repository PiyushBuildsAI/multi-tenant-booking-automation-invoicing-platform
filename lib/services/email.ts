import { sendEmailViaGmail } from "./calendar"

export async function sendAutomationEmail(
  to: string,
  subject: string,
  body: string,
  tenantId: string
) {
  return sendEmailViaGmail(to, subject, body, tenantId)
}

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  amount: number,
  dueDate: Date | null,
  tenantId: string
) {
  const subject = `Invoice ${invoiceNumber}${dueDate ? ` — Due ${dueDate.toLocaleDateString()}` : ""}`
  const body = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Invoice ${invoiceNumber}</h2>
      <p style="color: #374151;">Amount due: <strong>$${amount.toFixed(2)}</strong></p>
      ${dueDate ? `<p style="color: #6b7280;">Due: ${dueDate.toLocaleDateString()}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="color: #6b7280; font-size: 14px;">Thank you for your business.</p>
    </div>
  `
  return sendEmailViaGmail(to, subject, body, tenantId)
}

export async function sendBookingConfirmation(
  to: string,
  title: string,
  startTime: Date,
  tenantId: string
) {
  const subject = `Booking Confirmed: ${title}`
  const body = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmed</h2>
      <p style="color: #374151;"><strong>${title}</strong></p>
      <p style="color: #6b7280;">${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="color: #6b7280; font-size: 14px;">We look forward to seeing you!</p>
    </div>
  `
  return sendEmailViaGmail(to, subject, body, tenantId)
}

export async function sendBookingReminder(
  to: string,
  title: string,
  startTime: Date,
  tenantId: string
) {
  const subject = `Reminder: ${title} Tomorrow`
  const body = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Reminder</h2>
      <p style="color: #374151;">Reminder for your upcoming appointment:</p>
      <p style="color: #374151;"><strong>${title}</strong></p>
      <p style="color: #6b7280;">${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}</p>
    </div>
  `
  return sendEmailViaGmail(to, subject, body, tenantId)
}
