import { prisma } from "@/lib/prisma"
import { getTenantId, getTenant } from "@/lib/tenant"
import { createBookingTemplate, createEmailTemplate } from "@/app/actions/templates"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  FileText,
  Mail,
  Save,
  CheckCircle2,
  XCircle,
} from "lucide-react"

export default async function SettingsPage() {
  const tenantId = await getTenantId()
  const tenant = await getTenant()
  const invoiceTemplates = await prisma.invoiceTemplate.findMany({ where: { tenantId } })
  const emailTemplates = await prisma.emailTemplate.findMany({ where: { tenantId } })

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your business settings and templates.</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="invoice-templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice Templates
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Tenant</p>
                  <p className="text-xs text-zinc-500">Current business entity</p>
                </div>
                <span className="text-sm font-medium">{tenant?.name ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-zinc-500">PostgreSQL via Docker</p>
                </div>
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Email Provider</p>
                  <p className="text-xs text-zinc-500">Used for invoice sending and automation</p>
                </div>
                {process.env.RESEND_API_KEY ? (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <XCircle className="h-4 w-4" />
                    Set RESEND_API_KEY
                  </span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Google Calendar</p>
                  <p className="text-xs text-zinc-500">Booking sync integration</p>
                </div>
                {process.env.GOOGLE_CLIENT_ID ? (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <XCircle className="h-4 w-4" />
                    Set GOOGLE_CLIENT_ID
                  </span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Outlook Calendar</p>
                  <p className="text-xs text-zinc-500">Booking sync integration</p>
                </div>
                {process.env.OUTLOOK_CLIENT_ID ? (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <XCircle className="h-4 w-4" />
                    Set OUTLOOK_CLIENT_ID
                  </span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoice-templates" className="space-y-4">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Invoice Templates</h2>
            <form action={createBookingTemplate} className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Input name="name" placeholder="Template name" required />
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </div>
              <textarea
                name="content"
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="<h1>Invoice {{number}}</h1>..."
              />
            </form>
            {invoiceTemplates.length > 0 ? (
              <div className="space-y-2">
                {invoiceTemplates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border bg-zinc-50 px-3 py-2 text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-zinc-400">
                      {t.content.length} chars
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No invoice templates yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="email-templates" className="space-y-4">
          <div className="rounded-xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Email Templates</h2>
            <form action={createEmailTemplate} className="space-y-3 mb-6">
              <div className="grid grid-cols-3 gap-3">
                <Input name="name" placeholder="Template name" required />
                <Input name="subject" placeholder="Email subject" required />
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </div>
              <textarea
                name="body"
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="<h1>{{subject}}</h1><p>Your email body here...</p>"
              />
            </form>
            {emailTemplates.length > 0 ? (
              <div className="space-y-2">
                {emailTemplates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border bg-zinc-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-zinc-400 ml-2">— {t.subject}</span>
                    </div>
                    <span className="text-xs text-zinc-400">{t.body.length} chars</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No email templates yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
