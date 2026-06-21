import { prisma } from "@/lib/prisma"

export async function processAutomationSequence(sequenceId: string, context: {
  bookingId?: string
  invoiceId?: string
}) {
  const sequence = await prisma.automationSequence.findUnique({
    where: { id: sequenceId },
  })
  if (!sequence || !sequence.isActive) return

  const steps = sequence.steps as Array<{
    delay: number
    subject: string
    body: string
  }>

  for (const step of steps) {
    await prisma.automationLog.create({
      data: {
        action: `sequence:${sequence.id}:step`,
        status: "PENDING",
        message: `Scheduled: ${step.subject}`,
        metadata: { step, context },
        bookingId: context.bookingId,
        invoiceId: context.invoiceId,
        tenantId: sequence.tenantId,
      },
    })
  }
}

export async function triggerBookingSequences(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, tenant: true },
  })
  if (!booking) return

  const sequences = await prisma.automationSequence.findMany({
    where: {
      tenantId: booking.tenantId,
      triggerType: "BOOKING_CONFIRMED",
      isActive: true,
    },
  })

  for (const seq of sequences) {
    await processAutomationSequence(seq.id, { bookingId })
  }
}

export async function triggerInvoiceSequences(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  })
  if (!invoice) return

  const sequences = await prisma.automationSequence.findMany({
    where: {
      tenantId: invoice.tenantId,
      triggerType: "INVOICE_SENT",
      isActive: true,
    },
  })

  for (const seq of sequences) {
    await processAutomationSequence(seq.id, { invoiceId })
  }
}
