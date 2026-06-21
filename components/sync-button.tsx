"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const sync = async () => {
    setSyncing(true)
    setMsg(null)
    try {
      const r = await fetch("/api/calendar/sync", { method: "POST" })
      const d = await r.json()
      if (d.imported > 0) setMsg(`Imported ${d.imported}`)
      else if (d.imported === 0) setMsg("No new events")
      else setMsg("Sync failed")
    } catch {
      setMsg("Sync failed")
    }
    setSyncing(false)
    setTimeout(() => setMsg(null), 4000)
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={sync} disabled={syncing}>
        <Download className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync Google"}
      </Button>
      {msg && (
        <div className="absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md border bg-white px-2.5 py-1 text-xs text-zinc-600 shadow-sm z-10">
          {msg}
        </div>
      )}
    </div>
  )
}
