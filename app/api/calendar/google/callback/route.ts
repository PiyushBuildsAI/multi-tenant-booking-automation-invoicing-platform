import { NextResponse } from "next/server"
import { exchangeGoogleCode } from "@/lib/services/calendar"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const tenantId = searchParams.get("state") ?? "demo"

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    await exchangeGoogleCode(code, tenantId)
    return NextResponse.redirect(new URL("/calendar?connected=google", request.url))
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.json({ error: "Failed to exchange code" }, { status: 500 })
  }
}
