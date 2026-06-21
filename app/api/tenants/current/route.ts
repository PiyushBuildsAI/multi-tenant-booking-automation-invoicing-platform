import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const tenant = await prisma.tenant.findFirst({
    select: { id: true, name: true, slug: true },
  })
  return NextResponse.json(tenant ?? {})
}
