import { cookies } from "next/headers"
import { prisma } from "./prisma"

export async function getTenantId(): Promise<string> {
  const cookieStore = await cookies()
  const tid = cookieStore.get("tenant_id")?.value
  if (tid) {
    const exists = await prisma.tenant.findUnique({ where: { id: tid } })
    if (exists) return tid
  }

  const tenant = await prisma.tenant.findFirst()
  if (tenant) return tenant.id

  const created = await prisma.tenant.create({
    data: { name: "Default Business", slug: "default-business" },
  })
  return created.id
}

export async function setTenantId(tid: string) {
  const cookieStore = await cookies()
  cookieStore.set("tenant_id", tid, { path: "/", maxAge: 60 * 60 * 24 * 365 })
}

export async function getTenant() {
  const id = await getTenantId()
  return prisma.tenant.findUnique({ where: { id } })
}
