import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Trash2, Send, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"

const statusStyles: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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

  const totalOutstanding = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + Number(i.amount), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-zinc-500 mt-1">Create, send, and manage invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Total</p>
          <p className="text-xl font-semibold mt-1">{invoices.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Paid</p>
          <p className="text-xl font-semibold mt-1 text-emerald-600">
            {invoices.filter((i) => i.status === "PAID").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Outstanding</p>
          <p className="text-xl font-semibold mt-1 text-amber-600">
            {invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Amount Due</p>
          <p className="text-xl font-semibold mt-1 text-red-600">
            ${totalOutstanding.toLocaleString()}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-12 text-center shadow-sm">
          <FileText className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-zinc-500">No invoices yet. Create your first invoice.</p>
          <Link href="/invoices/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50/50">
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Invoice</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Customer</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Due Date</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-5 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium">{inv.number}</td>
                  <td className="px-5 py-4 text-zinc-600">{inv.customer.name}</td>
                  <td className="px-5 py-4 font-medium">
                    ${Number(inv.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-zinc-600">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusStyles[inv.status] ?? "outline"} className="capitalize">
                      {inv.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status === "DRAFT" && (
                        <form action={updateInvoiceStatus.bind(null, inv.id, "SENT")}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Send">
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                      {inv.status === "SENT" && (
                        <>
                          <form action={updateInvoiceStatus.bind(null, inv.id, "PAID")}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title="Mark Paid">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          </form>
                          <form action={updateInvoiceStatus.bind(null, inv.id, "OVERDUE")}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" title="Mark Overdue">
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </form>
                        </>
                      )}
                      <form action={deleteInvoice.bind(null, inv.id)}>
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
        </div>
      )}
    </div>
  )
}
