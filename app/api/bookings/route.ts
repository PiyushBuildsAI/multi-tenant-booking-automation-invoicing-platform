import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { startTime: "desc" },
    include: { customer: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(bookings)
}

export async function POST(request: Request) {
  const json = await request.json()
  const booking = await prisma.booking.create({
    data: {
      title: json.title,
      description: json.description,
      startTime: new Date(json.startTime),
      endTime: new Date(json.endTime),
      customerId: json.customerId,
      tenantId: json.tenantId ?? "demo",
    },
    include: { customer: { select: { id: true, name: true } } },
  })
  return NextResponse.json(booking, { status: 201 })
}
