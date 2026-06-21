"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  calendar: "Calendar",
  bookings: "Bookings",
  customers: "Customers",
  invoices: "Invoices",
  automations: "Automations",
  settings: "Settings",
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <>
      {segments.length > 1 && (
        <div className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-700 transition-colors">Home</Link>
          {segments.map((seg, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/")
            const label = labelMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
            const isLast = i === segments.length - 1
            return (
              <span key={seg} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {isLast ? (
                  <span className="text-zinc-600 font-medium">{label}</span>
                ) : (
                  <Link href={href} className="hover:text-zinc-700 transition-colors">{label}</Link>
                )}
              </span>
            )
          })}
        </div>
      )}
      {children}
    </>
  )
}
