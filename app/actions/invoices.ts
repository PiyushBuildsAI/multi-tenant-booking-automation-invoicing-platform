"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/tenant"
import { sendInvoiceEmail } from "@/lib/services/email"
import { triggerInvoiceSequences } from "@/lib/services/automation"

export async function createInvoice(formData: FormData) {
  const tenantId = await getTenantId()
  const customerId = formData.get("customerId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const dueDate = formData.get("dueDate") as string
  const notes = formData.get("notes") as string

  const count = await prisma.invoice.count()
  const number = `INV-${String(count + 1).padStart(4, "0")}`

  let systemUser = await prisma.user.findFirst({ where: { tenantId, role: "system" } })
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: { email: `system@${tenantId}.local`, name: "System", role: "system", tenantId },
    })
  }

  await prisma.invoice.create({
    data: {
      number,
      amount,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      customerId,
      tenantId,
      createdBy: systemUser.id,
    },
  })

  revalidatePath("/invoices")
  redirect("/invoices")
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const data: any = { status }
  if (status === "PAID") data.paidAt = new Date()

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data,
    include: { customer: true },
  })

  if (status === "SENT" && invoice.customer.email) {
    await Promise.allSettled([
      sendInvoiceEmail(
        invoice.customer.email,
        invoice.number,
        Number(invoice.amount),
        invoice.dueDate,
        invoice.tenantId
      ),
      triggerInvoiceSequences(invoice.id),
    ])
  }

  revalidatePath("/invoices")
}

export async function deleteInvoice(invoiceId: string) {
  await prisma.invoice.delete({ where: { id: invoiceId } })
  revalidatePath("/invoices")
}
