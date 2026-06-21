import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TopNav } from "@/components/topnav"
import { ClientLayout } from "@/components/client-layout"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FlowSync — Booking & Invoicing",
  description: "Multi-tenant booking automation and invoicing platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-zinc-50 text-foreground antialiased" suppressHydrationWarning>
        <TooltipProvider>
          <TopNav />
          <div className="px-6 py-6 max-w-7xl mx-auto">
            <ClientLayout>{children}</ClientLayout>
          </div>
        </TooltipProvider>
      </body>
    </html>
  )
}
