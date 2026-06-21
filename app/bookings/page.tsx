import { prisma } from "@/lib/prisma"
import { Chip } from "@heroui/react"

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "desc" },
    include: { customer: { select: { name: true } } },
  })

  const statusColor: Record<string, "warning" | "success" | "primary" | "danger" | "default"> = {
    SCHEDULED: "warning",
    CONFIRMED: "primary",
    COMPLETED: "success",
    CANCELLED: "danger",
    NO_SHOW: "danger",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-zinc-500 text-sm">Manage all appointments.</p>
        </div>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="px-6 py-4 font-medium">{b.title}</td>
                  <td className="px-6 py-4 text-zinc-500">{b.customer.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(b.startTime).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Chip variant="soft" size="sm">{b.status}</Chip>
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
