"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBooking } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewBookingPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email?: string }>>([])

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {})
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/bookings" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New Booking</h1>
        <p className="text-sm text-zinc-500 mt-1">Schedule a new appointment.</p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <form action={createBooking} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" placeholder="e.g. Initial Consultation" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              name="customerId"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.email ? ` (${c.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Booking details, notes, or instructions..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input type="datetime-local" name="startTime" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input type="datetime-local" name="endTime" required />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              Create Booking
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
