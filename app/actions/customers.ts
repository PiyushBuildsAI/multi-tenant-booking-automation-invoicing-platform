"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/tenant"

export async function createCustomer(formData: FormData) {
  const tenantId = await getTenantId()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const notes = formData.get("notes") as string

  await prisma.customer.create({
    data: { name, email, phone, notes, tenantId },
  })

  revalidatePath("/customers")
  redirect("/customers")
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } })
  revalidatePath("/customers")
}
