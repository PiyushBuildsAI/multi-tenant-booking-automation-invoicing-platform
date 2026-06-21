import { prisma } from "@/lib/prisma"

export default async function AutomationsPage() {
  const sequences = await prisma.automationSequence.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-zinc-500 text-sm">Configure automated email sequences for bookings and invoices.</p>
        </div>
      </div>
      <div className="grid gap-4">
        {sequences.length === 0 ? (
          <div className="bg-white border rounded-xl p-6">
            <p className="text-sm text-zinc-400">No automation sequences yet. Create your first sequence to automate booking reminders and invoice follow-ups.</p>
          </div>
        ) : (
          sequences.map(seq => (
            <div key={seq.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-medium">{seq.name}</p>
                <p className="text-sm text-zinc-500">{seq.description}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${seq.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {seq.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
