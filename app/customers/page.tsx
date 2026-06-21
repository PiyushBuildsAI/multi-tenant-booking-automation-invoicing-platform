import { prisma } from "@/lib/prisma"

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true, invoices: true } } },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-zinc-500 text-sm">Track customer journey and opportunities.</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        {customers.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No customers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Bookings</th>
                <th className="px-6 py-3 font-medium">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{c.email ?? "—"}</td>
                  <td className="px-6 py-4 text-zinc-500">{c._count.bookings}</td>
                  <td className="px-6 py-4 text-zinc-500">{c._count.invoices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
