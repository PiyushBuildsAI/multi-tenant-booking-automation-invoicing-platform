import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { updateBookingStatus, deleteBooking } from "@/app/actions/bookings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Plus,
  ExternalLink,
  CalendarCheck,
} from "lucide-react"
import Link from "next/link"

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  CONFIRMED: "secondary",
  SCHEDULED: "outline",
  IN_PROGRESS: "default",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

export default async function BookingsPage() {
  const tenantId = await getTenantId()
  const bookings = await prisma.booking.findMany({
    where: { tenantId },
    orderBy: { startTime: "desc" },
    include: { customer: { select: { name: true, email: true } } },
  })

  const statusCounts = {
    total: bookings.length,
    upcoming: bookings.filter((b) => b.startTime >= new Date()).length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all appointments and schedules.</p>
        </div>
        <Link href="/bookings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Total</p>
          <p className="text-xl font-semibold mt-1">{statusCounts.total}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Upcoming</p>
          <p className="text-xl font-semibold mt-1 text-blue-600">{statusCounts.upcoming}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Completed</p>
          <p className="text-xl font-semibold mt-1 text-emerald-600">{statusCounts.completed}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Cancelled</p>
          <p className="text-xl font-semibold mt-1 text-red-600">{statusCounts.cancelled}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <CalendarCheck className="h-12 w-12 text-zinc-300" />
            <p className="text-sm text-zinc-500">No bookings yet. Create your first booking to get started.</p>
            <Link href="/bookings/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/50">
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Title</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Customer</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Time</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Calendar</th>
                <th className="px-5 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium">{b.title}</p>
                    {b.description && (
                      <p className="text-xs text-zinc-400 truncate max-w-[200px]">{b.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm">{b.customer.name}</p>
                    {b.customer.email && (
                      <p className="text-xs text-zinc-400">{b.customer.email}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {new Date(b.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {new Date(b.startTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusStyles[b.status] ?? "outline"} className="capitalize">
                      {b.status.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    {b.externalId ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Synced
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <form action={updateBookingStatus.bind(null, b.id, "CONFIRMED")}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </form>
                      <form action={updateBookingStatus.bind(null, b.id, "COMPLETED")}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </form>
                      <form action={updateBookingStatus.bind(null, b.id, "CANCELLED")}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </form>
                      <form action={deleteBooking.bind(null, b.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
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
