"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react"

export default function CalendarPage() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [outlookConnected, setOutlookConnected] = useState(false)

  useEffect(() => {
    fetch("/api/calendar/connect")
      .then((r) => r.json())
      .then((d) => {
        if (d?.provider === "GOOGLE") setGoogleConnected(true)
        if (d?.provider === "OUTLOOK") setOutlookConnected(true)
      })
      .catch(() => {})
  }, [])

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const connectGoogle = () => {
    if (!GOOGLE_CLIENT_ID) return
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/api/calendar/google/callback`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events",
      access_type: "offline",
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const hasGoogleKeys = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const hasOutlookKeys = !!process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar Integration</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Connect your calendar to sync bookings and automate scheduling.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Google Calendar</h3>
                  <p className="text-sm text-zinc-500">Sync events and automate booking creation.</p>
                </div>
              </div>
            </div>
            {googleConnected && (
              <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {!hasGoogleKeys ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">API key required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your .env.local file.
                  </p>
                </div>
              </div>
            ) : googleConnected ? null : (
              <Button onClick={connectGoogle} className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Connect Google Calendar
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Outlook Calendar</h3>
                  <p className="text-sm text-zinc-500">Sync events and automate booking creation.</p>
                </div>
              </div>
            </div>
            {outlookConnected && (
              <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {!hasOutlookKeys ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">API key required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_OUTLOOK_CLIENT_ID</code> in your .env.local file.
                  </p>
                </div>
              </div>
            ) : outlookConnected ? null : (
              <Button variant="outline" className="w-full gap-2" disabled>
                <ExternalLink className="h-4 w-4" />
                Connect Outlook Calendar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <h2 className="font-semibold mb-2">Synced Events</h2>
        <p className="text-sm text-zinc-400">
          Events from connected calendars will appear here once synced. Bookings are automatically
          synced to your calendar when created.
        </p>
      </div>
    </div>
  )
}
