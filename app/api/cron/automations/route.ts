import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAutomationEmail, sendBookingReminder, sendInvoiceEmail } from "@/lib/services/email"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const logs: Array<{ id: string; action: string; status: string }> = []

  const pendingLogs = await prisma.automationLog.findMany({
    where: { status: "PENDING" },
    include: {
      booking: { include: { customer: true } },
      invoice: { include: { customer: true } },
    },
  })

  for (const log of pendingLogs) {
    try {
      if (log.metadata && typeof log.metadata === "object") {
        const meta = log.metadata as any
        const step = meta.step

        if (log.booking?.customer?.email && step?.subject && step?.body) {
          await sendAutomationEmail(
            log.booking.customer.email,
            step.subject,
            step.body,
            log.tenantId
          )
        }

        if (log.invoice?.customer?.email) {
          await sendInvoiceEmail(
            log.invoice.customer.email,
            log.invoice.number,
            Number(log.invoice.amount),
            log.invoice.dueDate,
            log.tenantId
          )
        }
      }

      await prisma.automationLog.update({
        where: { id: log.id },
        data: { status: "SENT" },
      })
      logs.push({ id: log.id, action: log.action, status: "SENT" })
    } catch (error) {
      await prisma.automationLog.update({
        where: { id: log.id },
        data: { status: "FAILED", message: String(error) },
      })
      logs.push({ id: log.id, action: log.action, status: "FAILED" })
    }
  }

  return NextResponse.json({ processed: logs.length, logs })
}
