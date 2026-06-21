import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { toggleSequence, deleteSequence } from "@/app/actions/automations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Plus, Trash2, Power, PowerOff } from "lucide-react"
import Link from "next/link"
import type { AutomationSequence } from "@prisma/client"

export default async function AutomationsPage() {
  const tenantId = await getTenantId()
  const sequences: AutomationSequence[] = await prisma.automationSequence.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure automated email sequences for bookings and invoices.
          </p>
        </div>
        <Link href="/automations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Sequence
          </Button>
        </Link>
      </div>

      {sequences.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-12 text-center shadow-sm">
          <Zap className="h-12 w-12 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            No automation sequences yet. Create your first sequence to automate reminders and follow-ups.
          </p>
          <Link href="/automations/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Sequence
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sequences.map((seq) => {
            const steps = seq.steps as Array<{ delay: number; subject: string }>
            return (
              <div key={seq.id} className="rounded-xl border bg-white shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{seq.name}</h3>
                      <Badge
                        variant={seq.isActive ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {seq.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {seq.triggerType.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {seq.description && (
                      <p className="text-sm text-zinc-500 mt-2">{seq.description}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-2">
                      {steps.length} step{steps.length !== 1 ? "s" : ""} · {seq.channel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleSequence.bind(null, seq.id, !seq.isActive)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 ${seq.isActive ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {seq.isActive ? (
                          <>
                            <PowerOff className="h-3 w-3" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3" />
                            Activate
                          </>
                        )}
                      </Button>
                    </form>
                    <form action={deleteSequence.bind(null, seq.id)}>
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Steps</p>
                    <div className="space-y-2">
                      {steps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg border bg-zinc-50 px-3 py-2 text-sm"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600">
                            {i + 1}
                          </span>
                          <span className="text-zinc-600">{step.subject}</span>
                          {step.delay > 0 && (
                            <Badge variant="outline" className="ml-auto text-[10px]">
                              +{step.delay}h delay
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
