import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const json = await request.json()
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      amount: json.amount,
      status: json.status,
      dueDate: json.dueDate ? new Date(json.dueDate) : undefined,
      lineItems: json.lineItems,
      notes: json.notes,
      paidAt: json.status === "PAID" ? new Date() : undefined,
    },
  })
  return NextResponse.json(invoice)
}
