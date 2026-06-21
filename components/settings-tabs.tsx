"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Building2, FileText, Mail, Save, CheckCircle2, XCircle } from "lucide-react"
import { createBookingTemplate, createEmailTemplate } from "@/app/actions/templates"

const tabs = [
  { id: "business", label: "Business", icon: Building2 },
  { id: "invoice-templates", label: "Invoice Templates", icon: FileText },
  { id: "email-templates", label: "Email Templates", icon: Mail },
]

export function SettingsTabs({
  tenant,
  invoiceTemplates,
  emailTemplates,
}: {
  tenant: { name: string } | null
  invoiceTemplates: Array<{ id: string; name: string; content: string }>
  emailTemplates: Array<{ id: string; name: string; subject: string; body: string }>
}) {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") ?? "business"

  const services = [
    { label: "Database", ok: true },
    { label: "Email (Gmail)", ok: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID },
    { label: "Google Calendar", ok: !!process.env.GOOGLE_CLIENT_SECRET },
    { label: "Outlook Calendar", ok: !!process.env.OUTLOOK_CLIENT_SECRET },
  ]

  return (
    <Tabs defaultValue={tab} key={tab}>
      <TabsList>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs">
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="business" className="mt-4 space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm font-medium mb-3">Business Profile</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Tenant</span>
              <Badge variant="outline" className="text-xs">{tenant?.name ?? "—"}</Badge>
            </div>
            <Separator />
            {services.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{s.label}</span>
                  <span className={`flex items-center gap-1 text-xs ${s.ok ? "text-emerald-600" : "text-amber-600"}`}>
                    {s.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {s.ok ? "Ready" : "Not configured"}
                  </span>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="invoice-templates" className="mt-4 space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm font-medium mb-3">Invoice Templates</p>
          <form action={createBookingTemplate} className="space-y-3 mb-4 rounded-md bg-zinc-50 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input name="name" placeholder="Template name" required className="h-8 text-xs" />
              <Button type="submit" size="sm" className="gap-1.5 text-xs h-8">
                <Save className="h-3.5 w-3.5" />Save
              </Button>
            </div>
            <textarea
              name="content"
              rows={3}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-mono"
              placeholder="<h1>Invoice {{number}}</h1>..."
            />
          </form>
          {invoiceTemplates.length > 0 ? (
            <div className="space-y-1">
              {invoiceTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-zinc-400">{t.content.length} chars</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">No templates yet.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="email-templates" className="mt-4 space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm font-medium mb-3">Email Templates</p>
          <form action={createEmailTemplate} className="space-y-3 mb-4 rounded-md bg-zinc-50 p-3">
            <div className="grid grid-cols-3 gap-2">
              <Input name="name" placeholder="Name" required className="h-8 text-xs" />
              <Input name="subject" placeholder="Subject" required className="h-8 text-xs" />
              <Button type="submit" size="sm" className="gap-1.5 text-xs h-8">
                <Save className="h-3.5 w-3.5" />Save
              </Button>
            </div>
            <textarea
              name="body"
              rows={3}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-mono"
              placeholder="<h1>{{subject}}</h1>..."
            />
          </form>
          {emailTemplates.length > 0 ? (
            <div className="space-y-1">
              {emailTemplates.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
                  <span>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-zinc-400 ml-1">— {t.subject}</span>
                  </span>
                  <span className="text-zinc-400">{t.body.length} chars</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">No templates yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
