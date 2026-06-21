import { NextRequest, NextResponse } from "next/server"
import { getTenantId } from "@/lib/tenant"
import { fetchGoogleCalendarEvents } from "@/lib/services/calendar"

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const count = await fetchGoogleCalendarEvents(tenantId)
    return NextResponse.json({ imported: count })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
