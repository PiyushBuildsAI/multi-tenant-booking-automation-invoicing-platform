"use client"

import { Card, Button, Chip } from "@heroui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Calendar", href: "/calendar" },
  { label: "Bookings", href: "/bookings" },
  { label: "Customers", href: "/customers" },
  { label: "Invoices", href: "/invoices" },
  { label: "Automations", href: "/automations" },
  { label: "Settings", href: "/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-4 flex flex-col gap-2">
        <h2 className="text-lg font-bold px-3 py-2">Booking Platform</h2>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-zinc-50">{children}</main>
    </div>
  )
}
