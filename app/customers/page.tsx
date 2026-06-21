import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { deleteCustomer } from "@/app/actions/customers"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Mail, Phone, Calendar, Receipt, User, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const gradients = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-violet-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
]

export default async function CustomersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const tenantId = await getTenantId()
  const customers = await prisma.customer.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true, invoices: true } },
      bookings: {
        take: 3,
        orderBy: { startTime: "desc" },
        select: { title: true, startTime: true, status: true },
      },
      invoices: {
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { number: true, amount: true, status: true, createdAt: true },
      },
    },
  })

  const total = customers.length
  const withBookings = customers.filter((c) => c._count.bookings > 0).length
  const withInvoices = customers.filter((c) => c._count.invoices > 0).length

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function getGradient(index: number) {
    return gradients[index % gradients.length]
  }

  function statusLabel(status: string) {
    switch (status) {
      case "COMPLETED": return { label: "Completed", class: "bg-emerald-50 text-emerald-700" }
      case "CONFIRMED": return { label: "Confirmed", class: "bg-blue-50 text-blue-700" }
      case "SCHEDULED": return { label: "Scheduled", class: "bg-zinc-50 text-zinc-600" }
      case "CANCELLED": return { label: "Cancelled", class: "bg-red-50 text-red-700" }
      case "PAID": return { label: "Paid", class: "bg-emerald-50 text-emerald-700" }
      case "SENT": return { label: "Sent", class: "bg-blue-50 text-blue-700" }
      case "DRAFT": return { label: "Draft", class: "bg-zinc-50 text-zinc-600" }
      case "OVERDUE": return { label: "Overdue", class: "bg-red-50 text-red-700" }
      case "IN_PROGRESS": return { label: "In Progress", class: "bg-amber-50 text-amber-700" }
      default: return { label: status.toLowerCase(), class: "bg-zinc-50 text-zinc-600" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Customers</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track customer journey and engagement.</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="text-lg font-semibold mt-0.5">{total}</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-zinc-500">With bookings</p>
          <p className="text-lg font-semibold mt-0.5 text-blue-600">{withBookings}</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-zinc-500">With invoices</p>
          <p className="text-lg font-semibold mt-0.5 text-violet-600">{withInvoices}</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border bg-white py-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-zinc-100 p-3">
              <User className="h-6 w-6 text-zinc-400" />
            </div>
          </div>
          <p className="text-sm text-zinc-500 mb-1">No customers yet</p>
          <p className="text-xs text-zinc-400 mb-4">Add your first customer to get started.</p>
          <Link href="/customers/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c, i) => {
            const initials = getInitials(c.name)
            const gradient = getGradient(i)

            return (
              <div key={c.id} className="group rounded-lg border bg-white hover:shadow-sm hover:border-zinc-200 transition-all">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-zinc-900 truncate">{c.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          {c.email && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[200px]">{c.email}</span>
                            </span>
                          )}
                          {c.phone && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400">
                              <Phone className="h-3 w-3 shrink-0" />
                              {c.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 rounded-md px-2 py-1">
                        <Calendar className="h-3 w-3" />
                        {c._count.bookings}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 rounded-md px-2 py-1">
                        <Receipt className="h-3 w-3" />
                        {c._count.invoices}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    {c.notes && (
                      <p className="text-xs text-zinc-400 italic flex-1 truncate border-l-2 border-zinc-200 pl-2">
                        {c.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-zinc-300">
                        Added {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <form action={deleteCustomer.bind(null, c.id)}>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </form>
                    </div>
                  </div>

                  {(c.bookings.length > 0 || c.invoices.length > 0) && (
                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3">
                      {c.bookings.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Bookings</span>
                          </div>
                          <div className="space-y-1">
                            {c.bookings.map((b, bi) => (
                              <div key={bi} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-600 truncate mr-2">{b.title}</span>
                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${statusLabel(b.status).class}`}>
                                  {statusLabel(b.status).label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.invoices.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Receipt className="h-3 w-3 text-violet-500" />
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Invoices</span>
                          </div>
                          <div className="space-y-1">
                            {c.invoices.map((inv, ii) => (
                              <div key={ii} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-600">{inv.number}</span>
                                <span className="font-medium text-zinc-800">${Number(inv.amount).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
