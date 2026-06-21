"use client"

import { useState } from "react"
import { createSequence } from "@/app/actions/automations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap, ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"

const TRIGGER_OPTIONS = [
  { value: "BOOKING_CONFIRMED", label: "Booking Confirmed" },
  { value: "BOOKING_REMINDER", label: "Booking Reminder" },
  { value: "INVOICE_SENT", label: "Invoice Sent" },
  { value: "INVOICE_OVERDUE", label: "Invoice Overdue" },
  { value: "INVOICE_PAID", label: "Invoice Paid" },
]

export default function NewSequencePage() {
  const [steps, setSteps] = useState<Array<{ delay: number; subject: string; body: string }>>([])

  const addStep = () => {
    setSteps([...steps, { delay: 0, subject: "", body: "" }])
  }

  const updateStep = (i: number, field: string, value: string | number) => {
    const updated = [...steps]
    updated[i] = { ...updated[i], [field]: value }
    setSteps(updated)
  }

  const removeStep = (i: number) => {
    setSteps(steps.filter((_, idx) => idx !== i))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/automations"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Automations
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New Automation Sequence</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Create an automated email sequence triggered by events.
        </p>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <form action={createSequence} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input name="name" placeholder="e.g. Booking Follow-up" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What does this sequence do?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Event</label>
              <select
                name="triggerType"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {TRIGGER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel</label>
              <select
                name="channel"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="EMAIL">Email</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Steps</label>
              <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1">
                <Plus className="h-3 w-3" />
                Add Step
              </Button>
            </div>
            <input type="hidden" name="steps" value={JSON.stringify(steps)} />

            {steps.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-sm text-zinc-400">
                  No steps yet. Click "Add Step" to build your sequence.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="rounded-lg border bg-zinc-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-zinc-300" />
                        <span className="text-xs font-medium text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded">
                          Step {i + 1}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(i)}
                        className="h-7 text-xs text-red-500 hover:text-red-600 gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Delay (hours)</label>
                        <Input
                          type="number"
                          value={step.delay}
                          onChange={(e) => updateStep(i, "delay", parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-xs text-zinc-500">Subject</label>
                        <Input
                          value={step.subject}
                          onChange={(e) => updateStep(i, "subject", e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Email subject line"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-500">Email Body (HTML)</label>
                      <textarea
                        value={step.body}
                        onChange={(e) => updateStep(i, "body", e.target.value)}
                        rows={3}
                        className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="<h1>Your booking is confirmed!</h1>..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="gap-2" disabled={steps.length === 0}>
              <Zap className="h-4 w-4" />
              Create Sequence
            </Button>
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
