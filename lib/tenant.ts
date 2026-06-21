import { cookies, headers } from "next/headers"
import { prisma } from "./prisma"
import { auth } from "./auth"

export async function getTenantId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.tenantId) return session.user.tenantId as string

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
