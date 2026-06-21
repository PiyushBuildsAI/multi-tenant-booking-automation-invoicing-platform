# ---- Build Stage ----
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json ./
RUN bun install

COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN bunx prisma generate

COPY . .
RUN bun run build

# ---- Production Stage ----
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "server.js"]
