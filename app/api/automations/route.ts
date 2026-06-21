import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sequences = await prisma.automationSequence.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(sequences)
}

export async function POST(request: Request) {
  const json = await request.json()
  const sequence = await prisma.automationSequence.create({
    data: {
      name: json.name,
      description: json.description,
      triggerType: json.triggerType,
      channel: json.channel ?? "EMAIL",
      steps: json.steps,
      tenantId: json.tenantId ?? "demo",
    },
  })
  return NextResponse.json(sequence, { status: 201 })
}
