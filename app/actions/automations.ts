"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/tenant"

export async function createSequence(formData: FormData) {
  const tenantId = await getTenantId()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const triggerType = formData.get("triggerType") as string
  const channel = formData.get("channel") as string

  const stepsRaw = formData.get("steps") as string
  const steps = stepsRaw ? JSON.parse(stepsRaw) : []

  await prisma.automationSequence.create({
    data: {
      name,
      description,
      triggerType: triggerType as any,
      channel: (channel as any) ?? "EMAIL",
      steps,
      tenantId,
    },
  })

  revalidatePath("/automations")
  redirect("/automations")
}

export async function toggleSequence(id: string, isActive: boolean) {
  await prisma.automationSequence.update({
    where: { id },
    data: { isActive },
  })
  revalidatePath("/automations")
}

export async function deleteSequence(id: string) {
  await prisma.automationSequence.delete({ where: { id } })
  revalidatePath("/automations")
}
