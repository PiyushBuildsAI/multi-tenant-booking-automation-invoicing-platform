import { NextResponse } from "next/server"
import { exchangeOutlookCode } from "@/lib/services/calendar"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  let tenantId = searchParams.get("state") ?? ""

  if (!tenantId) {
    const tenant = await prisma.tenant.findFirst({ select: { id: true } })
    tenantId = tenant?.id ?? ""
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    await exchangeOutlookCode(code, tenantId)
    return NextResponse.redirect(new URL("/calendar?connected=outlook", request.url))
  } catch (error) {
    console.error("Outlook OAuth error:", error)
    return NextResponse.redirect(new URL("/calendar?error=outlook_failed", request.url))
  }
}
