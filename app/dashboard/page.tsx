import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import {
  CalendarCheck,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"

async function getStats() {
  const tenantId = await getTenantId()
  const [totalBookings, upcoming, customers, invoices, revenue] = await Promise.all([
    prisma.booking.count({ where: { tenantId } }),
    prisma.booking.count({ where: { tenantId, startTime: { gte: new Date() } } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { tenantId, status: "PAID" } }),
  ])
  const recentBookings = await prisma.booking.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  })
  const recentInvoices = await prisma.invoice.findMany({
    where: { tenantId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  })
  return {
    totalBookings,
    upcoming,
    customers,
    invoices,
    revenue: Number(revenue._sum.amount ?? 0),
    recentBookings,
    recentInvoices,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: CalendarCheck,
      trend: "+12%",
      up: true,
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: TrendingUp,
      trend: stats.upcoming > 0 ? "Scheduled" : "None",
      up: true,
    },
    {
      label: "Customers",
      value: stats.customers,
      icon: Users,
      trend: "+8%",
      up: true,
    },
    {
      label: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      trend: stats.revenue > 0 ? "+" : "",
      up: stats.revenue > 0,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your business performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">{c.label}</span>
              <div className="rounded-lg bg-zinc-100 p-2">
                <c.icon className="h-4 w-4 text-zinc-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold mt-3">{c.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {c.up ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${c.up ? "text-emerald-600" : "text-red-600"}`}>
                {c.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-medium">Recent Bookings</h2>
            <Link href="/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentBookings.length === 0 ? (
            <p className="p-5 text-sm text-zinc-400">No bookings yet.</p>
          ) : (
            <div className="divide-y">
              {stats.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-zinc-500">{b.customer.name}</p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(b.startTime).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-medium">Recent Invoices</h2>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentInvoices.length === 0 ? (
            <p className="p-5 text-sm text-zinc-400">No invoices yet.</p>
          ) : (
            <div className="divide-y">
              {stats.recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{inv.number}</p>
                    <p className="text-xs text-zinc-500">{inv.customer.name}</p>
                  </div>
                  <span className="text-sm font-medium">
                    ${Number(inv.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
