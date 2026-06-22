"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, ExternalLink, AlertCircle, Download, RefreshCw } from "lucide-react"

export default function CalendarPage() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [tenantId, setTenantId] = useState("")
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/calendar/connect").then((r) => r.json()),
      fetch("/api/tenants/current").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([cal, tenant]) => {
        if (cal?.provider === "GOOGLE") setGoogleConnected(true)
        if (cal?.provider === "OUTLOOK") setOutlookConnected(true)
        if (tenant?.id) setTenantId(tenant.id)
      })
      .catch(() => {})
  }, [])

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const connectGoogle = () => {
    if (!GOOGLE_CLIENT_ID) return
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${appUrl}/api/calendar/google/callback`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send",
      access_type: "offline",
      prompt: "consent",
      state: tenantId,
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const syncGoogle = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const r = await fetch("/api/calendar/sync", { method: "POST" })
      const d = await r.json()
      if (d.imported > 0) setSyncMsg(`Imported ${d.imported} event${d.imported > 1 ? "s" : ""}`)
      else if (d.imported === 0) setSyncMsg("No new events to import")
      else setSyncMsg("Sync failed")
    } catch { setSyncMsg("Sync failed") }
    setSyncing(false)
    setTimeout(() => setSyncMsg(null), 5000)
  }

  const hasGoogleKeys = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const hasOutlookKeys = !!process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Calendar</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Connect your calendar to sync bookings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Google Calendar</p>
                <p className="text-xs text-zinc-400">Sync and automate booking creation.</p>
              </div>
            </div>
            {googleConnected && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Connected</Badge>}
          </div>

          {!hasGoogleKeys ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in .env.local
            </div>
          ) : googleConnected ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Bookings push to Google automatically.</p>
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={syncGoogle} disabled={syncing}>
                <Download className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Import from Google"}
              </Button>
              {syncMsg && <p className="text-xs text-center text-zinc-500">{syncMsg}</p>}
            </div>
          ) : (
            <Button size="sm" className="w-full gap-1.5" onClick={connectGoogle}>
              <ExternalLink className="h-4 w-4" />
              Connect Google Calendar
            </Button>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Outlook Calendar</p>
                <p className="text-xs text-zinc-400">Sync via Microsoft Graph API.</p>
              </div>
            </div>
            {outlookConnected && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Connected</Badge>}
          </div>

          {!hasOutlookKeys ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_OUTLOOK_CLIENT_ID</code> in .env.local
            </div>
          ) : outlookConnected ? (
            <p className="text-xs text-zinc-400 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Connected and syncing.</p>
          ) : (
            <Button variant="outline" size="sm" className="w-full gap-1.5" disabled>
              <ExternalLink className="h-4 w-4" />
              Connect Outlook Calendar
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <p className="text-sm font-medium mb-1">How it works</p>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>• Bookings created in FlowSync are pushed to your Google Calendar automatically.</li>
          <li>• Click &quot;Import from Google&quot; to pull Google events into your Bookings list.</li>
          <li>• Duplicates are prevented — events&apos; Google IDs are stored locally.</li>
        </ul>
      </div>
    </div>
  )
}
