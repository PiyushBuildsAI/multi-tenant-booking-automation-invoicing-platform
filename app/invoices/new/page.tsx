"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createInvoice } from "@/app/actions/invoices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText } from "lucide-react"

export default function NewInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New Invoice</h1>
        <p className="text-sm text-zinc-500 mt-1">Create a new invoice for a customer.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <form action={createInvoice} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              name="customerId"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount ($)</label>
            <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input name="dueDate" type="date" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Payment terms, notes, or additional information..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="gap-2">
              <FileText className="h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
