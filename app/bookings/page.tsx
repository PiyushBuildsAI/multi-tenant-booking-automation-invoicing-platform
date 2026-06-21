import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { updateBookingStatus, deleteBooking } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { SyncButton } from "@/components/sync-button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETED: "default",
  CONFIRMED: "secondary",
  SCHEDULED: "outline",
  IN_PROGRESS: "default",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
}

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const tenantId = await getTenantId()
  const bookings = await prisma.booking.findMany({
    where: { tenantId },
    orderBy: { startTime: "desc" },
    include: { customer: { select: { name: true, email: true } } },
  })

  const now = new Date()
  const upcoming = bookings.filter((b) => b.startTime >= now).length
  const completed = bookings.filter((b) => b.status === "COMPLETED").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bookings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage appointments and schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncButton />
          <Link href="/bookings/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-500">{bookings.length} total</span>
        <span className="text-blue-600 font-medium">{upcoming} upcoming</span>
        <span className="text-emerald-600 font-medium">{completed} completed</span>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <p className="text-sm text-zinc-400 mb-3">No bookings yet.</p>
          <Link href="/bookings/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Source</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const isImported = !!b.externalId
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.title}</p>
                      {b.description && <p className="text-xs text-zinc-400 truncate max-w-[160px]">{b.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{b.customer.name}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">
                      {new Date(b.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {new Date(b.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge[b.status] ?? "outline"} className="capitalize text-xs">
                        {b.status.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {isImported ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600">
                          <ExternalLink className="h-3 w-3" />
                          Google
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        {!isImported ? (
                          <>
                            <form action={updateBookingStatus.bind(null, b.id, "CONFIRMED")} className="inline">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" title="Confirm">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            </form>
                            <form action={updateBookingStatus.bind(null, b.id, "COMPLETED")} className="inline">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Complete">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            </form>
                            <form action={updateBookingStatus.bind(null, b.id, "CANCELLED")} className="inline">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Cancel">
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </form>
                          </>
                        ) : null}
                        <form action={deleteBooking.bind(null, b.id)} className="inline">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
