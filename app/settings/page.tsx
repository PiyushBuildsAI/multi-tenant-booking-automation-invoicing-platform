import { prisma } from "@/lib/prisma"
import { getTenantId, getTenant } from "@/lib/tenant"
import { SettingsTabs } from "@/components/settings-tabs"

export default async function SettingsPage() {
  const tenantId = await getTenantId()
  const tenant = await getTenant()
  const invoiceTemplates = await prisma.invoiceTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })
  const emailTemplates = await prisma.emailTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your business settings and templates.</p>
      </div>

      <SettingsTabs
        tenant={tenant ? { name: tenant.name } : null}
        invoiceTemplates={invoiceTemplates.map((t) => ({ id: t.id, name: t.name, content: t.content }))}
        emailTemplates={emailTemplates.map((t) => ({ id: t.id, name: t.name, subject: t.subject, body: t.body }))}
      />
    </div>
  )
}
