"use client"

import { PageShell } from "./page-shell"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>
}
