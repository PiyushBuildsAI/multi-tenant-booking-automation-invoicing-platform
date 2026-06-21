import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await hash("demo1234", 10)

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-business" },
    update: {},
    create: {
      name: "Demo Business",
      slug: "demo-business",
      users: {
        create: {
          name: "Demo User",
          email: "demo@example.com",
          password: hashedPassword,
          role: "admin",
        },
      },
    },
    include: { users: true },
  })

  console.log("Seed complete:")
  console.log("  Email:    demo@example.com")
  console.log("  Password: demo1234")
  console.log("  Tenant:   Demo Business")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
