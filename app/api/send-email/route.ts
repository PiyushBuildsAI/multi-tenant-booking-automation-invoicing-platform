import { NextResponse } from "next/server"
import { sendAutomationEmail } from "@/lib/services/email"

export async function POST(request: Request) {
  try {
    const { to, subject, body, tenantId } = await request.json()
    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 })
    }
    const result = await sendAutomationEmail(to, subject, body, tenantId ?? "demo")
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
