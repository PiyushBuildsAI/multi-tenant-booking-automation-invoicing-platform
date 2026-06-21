import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { deleteCustomer } from "@/app/actions/customers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Plus, Trash2, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default async function CustomersPage() {
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
        select: { number: true, amount: true, status: true },
      },
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-zinc-500 mt-1">Track customer journey and engagement.</p>
        </div>
        <Link href="/customers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-zinc-500">No customers yet. Add your first customer.</p>
          <Link href="/customers/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((c) => (
            <div key={c.id} className="rounded-xl border bg-white shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="font-medium">{c._count.bookings} bookings</span>
                  <span className="text-zinc-300">·</span>
                  <span className="font-medium">{c._count.invoices} invoices</span>
                </div>
              </div>

              {(c.bookings.length > 0 || c.invoices.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-6 rounded-lg bg-zinc-50 p-4">
                  {c.bookings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Recent Bookings
                      </p>
                      <div className="space-y-2">
                        {c.bookings.map((b) => (
                          <div key={b.title} className="flex items-center justify-between text-sm">
                            <span>{b.title}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {b.status.toLowerCase().replace(/_/g, " ")}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.invoices.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                        Recent Invoices
                      </p>
                      <div className="space-y-2">
                        {c.invoices.map((i) => (
                          <div key={i.number} className="flex items-center justify-between text-sm">
                            <span>{i.number}</span>
                            <span className="font-medium">${Number(i.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {c.notes && (
                <p className="mt-3 text-sm text-zinc-400 italic border-l-2 border-zinc-200 pl-3">
                  {c.notes}
                </p>
              )}

              <div className="mt-4">
                <form action={deleteCustomer.bind(null, c.id)}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 gap-1">
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
