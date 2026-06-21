import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true, invoices: true } } },
  })
  return NextResponse.json(customers)
}

export async function POST(request: Request) {
  const json = await request.json()
  const customer = await prisma.customer.create({
    data: { name: json.name, email: json.email, phone: json.phone, notes: json.notes, tenantId: json.tenantId ?? "demo" },
  })
  return NextResponse.json(customer, { status: 201 })
}
