import { prisma } from "@/lib/prisma"

async function getStats() {
  const [bookings, customers, invoices, revenue] = await Promise.all([
    prisma.booking.findMany({ take: 5, orderBy: { startTime: "desc" }, include: { customer: { select: { name: true } } } }),
    prisma.customer.count(),
    prisma.invoice.groupBy({ by: ["status"], _count: true }),
    prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
  ])
  const totalBookings = await prisma.booking.count()
  const upcoming = await prisma.booking.count({ where: { startTime: { gte: new Date() } } })
  return { bookings, customers, invoices, revenue: revenue._sum.amount ?? 0, totalBookings, upcoming }
}

export default async function DashboardPage() {
  const stats = await getStats()
  const paidInvoices = stats.invoices.find(i => i.status === "PAID")?._count ?? 0
  const pendingInvoices = stats.invoices.filter(i => i.status === "SENT" || i.status === "OVERDUE").reduce((a, i) => a + i._count, 0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Bookings", value: stats.totalBookings },
          { label: "Upcoming", value: stats.upcoming },
          { label: "Customers", value: stats.customers },
          { label: "Revenue", value: `$${Number(stats.revenue).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="text-3xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Recent Bookings</h2>
          {stats.bookings.length === 0 ? <p className="text-sm text-zinc-400">No bookings yet.</p> : (
            <ul className="space-y-3">
              {stats.bookings.map(b => (
                <li key={b.id} className="flex justify-between text-sm">
                  <div><p className="font-medium">{b.title}</p><p className="text-zinc-500">{b.customer.name}</p></div>
                  <span className="text-zinc-400 text-xs">{new Date(b.startTime).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">Invoice Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Paid</span><span className="font-medium">{paidInvoices}</span></div>
            <div className="flex justify-between"><span>Pending</span><span className="font-medium">{pendingInvoices}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
