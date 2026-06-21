import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { id: true, name: true } } },
  })
  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  const json = await request.json()
  const count = await prisma.invoice.count()
  const number = `INV-${String(count + 1).padStart(4, "0")}`
  const invoice = await prisma.invoice.create({
    data: {
      number,
      amount: json.amount,
      currency: json.currency ?? "USD",
      dueDate: json.dueDate ? new Date(json.dueDate) : null,
      lineItems: json.lineItems,
      notes: json.notes,
      customerId: json.customerId,
      tenantId: json.tenantId ?? "demo",
      createdBy: json.createdBy ?? "system",
    },
    include: { customer: { select: { id: true, name: true } } },
  })
  return NextResponse.json(invoice, { status: 201 })
}
