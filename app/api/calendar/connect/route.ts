import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let tenantId = searchParams.get("tenantId") ?? ""
  if (!tenantId) {
    const tenant = await prisma.tenant.findFirst({ select: { id: true } })
    tenantId = tenant?.id ?? ""
  }
  const token = await prisma.calendarToken.findFirst({
    where: { tenantId },
    select: { provider: true, calendarId: true },
  })
  return NextResponse.json(token ?? {})
}

export async function POST(request: Request) {
  const json = await request.json()
  const token = await prisma.calendarToken.upsert({
    where: { id: json.id ?? "" },
    update: {
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      expiresAt: json.expiresAt ? new Date(json.expiresAt) : null,
      calendarId: json.calendarId,
    },
    create: {
      provider: json.provider,
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      expiresAt: json.expiresAt ? new Date(json.expiresAt) : null,
      calendarId: json.calendarId,
      tenantId: json.tenantId ?? "demo",
    },
  })
  return NextResponse.json(token)
}
