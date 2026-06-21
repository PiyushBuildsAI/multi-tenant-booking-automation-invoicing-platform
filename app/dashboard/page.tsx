import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  CalendarCheck,
  Users,
  DollarSign,
  Receipt,
} from "lucide-react"
import Link from "next/link"

async function getStats() {
  const tenantId = await getTenantId()
  const [totalBookings, upcoming, customers, invoices, revenue, paidInvoices] = await Promise.all([
    prisma.booking.count({ where: { tenantId } }),
    prisma.booking.count({ where: { tenantId, startTime: { gte: new Date() } } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: "PAID" } }),
    prisma.invoice.count({ where: { tenantId, status: "PAID" } }),
  ])
  const [recentBookings, recentInvoices] = await Promise.all([
    prisma.booking.findMany({
      where: { tenantId }, take: 5, orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.invoice.findMany({
      where: { tenantId }, take: 5, orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
    }),
  ])
  return {
    totalBookings, upcoming, customers, invoices,
    revenue: Number(revenue._sum.amount ?? 0), paidInvoices,
    recentBookings, recentInvoices,
  }
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const stats = await getStats()

  const cards = [
    { label: "Bookings", value: stats.totalBookings, icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Customers", value: stats.customers, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Invoices", value: stats.invoices, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{c.label}</span>
              <div className={`rounded-md p-1.5 ${c.bg} ${c.color}`}>
                <c.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-medium">Recent Bookings</h2>
            <Link href="/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentBookings.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-400 text-center">No bookings yet.</p>
          ) : (
            <div className="divide-y">
              {stats.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm">{b.title}</p>
                    <p className="text-xs text-zinc-400">{b.customer.name}</p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(b.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-sm font-medium">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-400 text-center">No invoices yet.</p>
          ) : (
            <div className="divide-y">
              {stats.recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm">{inv.number}</p>
                    <p className="text-xs text-zinc-400">{inv.customer.name}</p>
                  </div>
                  <span className="text-sm font-medium">${Number(inv.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
