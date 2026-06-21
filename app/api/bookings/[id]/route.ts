import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: { select: { id: true, name: true, email: true } } },
  })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(booking)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const json = await request.json()
  const booking = await prisma.booking.update({
    where: { id },
    data: {
      title: json.title,
      description: json.description,
      startTime: json.startTime ? new Date(json.startTime) : undefined,
      endTime: json.endTime ? new Date(json.endTime) : undefined,
      status: json.status,
    },
  })
  return NextResponse.json(booking)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.booking.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
