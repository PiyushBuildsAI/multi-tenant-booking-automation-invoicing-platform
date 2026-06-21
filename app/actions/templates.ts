"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/tenant"

export async function createBookingTemplate(formData: FormData) {
  const tenantId = await getTenantId()
  const name = formData.get("name") as string
  const content = formData.get("content") as string

  await prisma.invoiceTemplate.create({
    data: { name, content, tenantId },
  })

  revalidatePath("/settings")
  redirect("/settings")
}

export async function createEmailTemplate(formData: FormData) {
  const tenantId = await getTenantId()
  const name = formData.get("name") as string
  const subject = formData.get("subject") as string
  const body = formData.get("body") as string

  await prisma.emailTemplate.create({
    data: { name, subject, body, tenantId },
  })

  revalidatePath("/settings")
  redirect("/settings")
}
