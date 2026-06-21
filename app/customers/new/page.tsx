"use client"

import { useRouter } from "next/navigation"
import { createCustomer } from "@/app/actions/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"

export default function NewCustomerForm() {
  const router = useRouter()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Add Customer</h1>
        <p className="text-sm text-zinc-500 mt-1">Add a new customer to your database.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <form action={createCustomer} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input name="name" placeholder="Full name" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" placeholder="customer@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" placeholder="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Any additional information about this customer..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="gap-2">
              <Users className="h-4 w-4" />
              Add Customer
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
