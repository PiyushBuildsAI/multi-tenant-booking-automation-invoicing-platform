import { prisma } from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant"
import { toggleSequence, deleteSequence } from "@/app/actions/automations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Plus, Trash2, Power, PowerOff, Clock, Mail } from "lucide-react"
import Link from "next/link"
import type { AutomationSequence } from "@prisma/client"

export default async function AutomationsPage() {
  const tenantId = await getTenantId()
  const sequences: AutomationSequence[] = await prisma.automationSequence.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Automations</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Configure automated email sequences.</p>
        </div>
        <Link href="/automations/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Sequence
          </Button>
        </Link>
      </div>

      {sequences.length === 0 ? (
        <div className="rounded-lg border bg-white py-12 text-center">
          <p className="text-sm text-zinc-400 mb-3">No automation sequences yet.</p>
          <Link href="/automations/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Sequence
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => {
            const steps = seq.steps as Array<{ delay: number; subject: string }>
            return (
              <div key={seq.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{seq.name}</p>
                      <Badge variant={seq.isActive ? "default" : "secondary"} className="text-xs capitalize">{seq.isActive ? "Active" : "Inactive"}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{seq.triggerType.toLowerCase().replace(/_/g, " ")}</Badge>
                    </div>
                    {seq.description && <p className="text-xs text-zinc-400 mt-1">{seq.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{seq.channel}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={toggleSequence.bind(null, seq.id, !seq.isActive)}>
                      <Button variant="outline" size="sm" className={`h-7 gap-1 text-xs ${seq.isActive ? "text-amber-600" : "text-emerald-600"}`}>
                        {seq.isActive ? <><PowerOff className="h-3 w-3" /> Deactivate</> : <><Power className="h-3 w-3" /> Activate</>}
                      </Button>
                    </form>
                    <form action={deleteSequence.bind(null, seq.id)}>
                      <Button variant="ghost" size="sm" className="h-7 text-zinc-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Steps</p>
                    <div className="space-y-1">
                      {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-md border bg-zinc-50 px-3 py-1.5 text-xs">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[9px] font-medium text-blue-600">{i + 1}</span>
                          <span>{step.subject}</span>
                          {step.delay > 0 && <Badge variant="outline" className="ml-auto text-[10px] h-4">+{step.delay}h</Badge>}
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
