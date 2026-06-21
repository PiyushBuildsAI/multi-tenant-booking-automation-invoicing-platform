"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Bookings", href: "/bookings" },
  { label: "Customers", href: "/customers" },
  { label: "Invoices", href: "/invoices" },
  { label: "Automations", href: "/automations" },
  { label: "Calendar", href: "/calendar" },
  { label: "Settings", href: "/settings" },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">FlowSync</span>
        </Link>

        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
