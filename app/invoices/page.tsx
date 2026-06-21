import { prisma } from "@/lib/prisma"
import { Chip } from "@heroui/react"

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  })

  const statusColor: Record<string, "success" | "danger" | "primary" | "warning" | "default"> = {
    PAID: "success",
    SENT: "primary",
    OVERDUE: "danger",
    DRAFT: "default",
    CANCELLED: "warning",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-zinc-500 text-sm">Create and manage invoices.</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="px-6 py-3 font-medium">Number</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b last:border-0">
                  <td className="px-6 py-4 font-medium">{inv.number}</td>
                  <td className="px-6 py-4 text-zinc-500">{inv.customer.name}</td>
                  <td className="px-6 py-4 text-zinc-500">${Number(inv.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Chip variant="soft" size="sm">{inv.status}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
