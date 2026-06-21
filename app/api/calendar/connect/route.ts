import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
