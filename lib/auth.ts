import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "./prisma"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      accessType: "offline",
      prompt: "select_account consent",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "admin",
        input: false,
      },
      tenantId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.tenantId) return { data: user }
          const tenant = await prisma.tenant.create({
            data: {
              name: `${user.name ?? "New"}'s Workspace`,
              slug: `t-${crypto.randomUUID().slice(0, 12)}`,
            },
          })
          return { data: { ...user, tenantId: tenant.id } }
        },
      },
    },
  },
  plugins: [nextCookies()],
})
