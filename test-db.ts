import { prisma } from "./lib/prisma"

async function main() {
  try {
    const res = await prisma.tenant.findFirst()
    console.log("Tenant:", res?.name ?? "No tenant")
  } catch (err) {
    console.error("Prisma query failed:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
