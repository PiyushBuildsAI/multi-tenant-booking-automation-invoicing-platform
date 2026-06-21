import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Send, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  SENT: "secondary",
  DRAFT: "outline",
  OVERDUE: "destructive",
  CANCELLED: "destructive",
}

export default async function InvoicesPage() {
  const tenantId = await getTenantId()
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true, email: true } } },
  })

  const paid = invoices.filter((i) => i.status === "PAID").length
  const outstanding = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").length
  const totalDue = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Invoices</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Create, send, and manage invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-500">{invoices.length} total</span>
        <span className="text-emerald-600 font-medium">{paid} paid</span>
        <span className="text-amber-600 font-medium">{outstanding} outstanding</span>
        <span className="text-violet-600 font-medium">${totalDue.toLocaleString()} due</span>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <p className="text-sm text-zinc-400 mb-3">No invoices yet.</p>
          <Link href="/invoices/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Due</th>
                <th className="px-4 py-3 font-medium text-zinc-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{inv.number}</td>
                  <td className="px-4 py-3 text-zinc-600">{inv.customer.name}</td>
                  <td className="px-4 py-3 font-medium">${Number(inv.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge[inv.status] ?? "outline"} className="capitalize text-xs">
                      {inv.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      {inv.status === "DRAFT" && (
                        <form action={updateInvoiceStatus.bind(null, inv.id, "SENT")} className="inline">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" title="Send">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      )}
                      {inv.status === "SENT" && (
                        <>
                          <form action={updateInvoiceStatus.bind(null, inv.id, "PAID")} className="inline">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Paid">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                          <form action={updateInvoiceStatus.bind(null, inv.id, "OVERDUE")} className="inline">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title="Overdue">
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </>
                      )}
                      <form action={deleteInvoice.bind(null, inv.id)} className="inline">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
