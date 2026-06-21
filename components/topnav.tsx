"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Zap, LogOut } from "lucide-react"
const { useSession } = authClient

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
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center gap-6 px-6">
        <Link href={session ? "/dashboard" : "/login"} className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">FlowSync</span>
        </Link>

        {session ? (
          <>
            <nav className="flex items-center gap-1 flex-1">
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    {session.user.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-sm text-zinc-600 hidden sm:inline">{session.user.name}</span>
              </div>
              <button
                onClick={async () => { await authClient.signOut(); window.location.href = "/login" }}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-end">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
