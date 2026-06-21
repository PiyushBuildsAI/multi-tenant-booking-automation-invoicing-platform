import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const resp = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.OUTLOOK_CLIENT_ID!,
        client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/outlook/callback`,
        grant_type: "authorization_code",
      }),
    })
    const tokens = await resp.json()

    return NextResponse.redirect(new URL("/calendar?connected=outlook", request.url))
  } catch (error) {
    console.error("Outlook OAuth error:", error)
    return NextResponse.json({ error: "Failed to exchange code" }, { status: 500 })
  }
}
