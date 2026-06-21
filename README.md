# FlowSync — Booking Automation & Invoicing Platform

Multi-tenant platform for booking management, automated email sequences, calendar sync, and invoicing.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** Shadcn UI + HeroUI v3 + Lucide icons
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma 7
- **Runtime:** Bun
- **Email:** Resend
- **Calendar:** Google Calendar API / Outlook Calendar API

## Prerequisites

- Bun 1.1+
- PostgreSQL database (local Docker or remote)
- Docker (optional, for containerized deployment)

## Quick Start (Local)

```bash
# 1. Install dependencies
bun install

# 2. Generate Prisma client
bunx prisma generate

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# 4. Push schema to database
bunx prisma db push

# 5. Seed demo data
bunx prisma db seed

# 6. Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

## Docker

```bash
# Build the image
docker build -t flowsync .

# Run with PostgreSQL on host machine
docker run -d \
  --name flowsync \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/multi_tenant_booking?schema=public" \
  flowsync

# Push schema + seed inside container
docker exec flowsync bunx prisma db push
docker exec flowsync bunx prisma db seed
```

### Docker + all integrations

```bash
docker run -d \
  --name flowsync \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/multi_tenant_booking?schema=public" \
  -e RESEND_API_KEY="re_..." \
  -e NEXT_PUBLIC_GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e NEXT_PUBLIC_OUTLOOK_CLIENT_ID="..." \
  -e OUTLOOK_CLIENT_SECRET="..." \
  -e CRON_SECRET="..." \
  flowsync
```

> Use `host.docker.internal` when PostgreSQL runs on the host machine.
> Use a Docker network + container name when PostgreSQL runs in another container.

### Docker Compose (PostgreSQL + app together)

Create `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/multi_tenant_booking?schema=public"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: multi_tenant_booking
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# Start both containers
docker compose up -d

# Push schema + seed
docker compose exec app bunx prisma db push
docker compose exec app bunx prisma db seed

# View logs
docker compose logs -f app
```

## API Keys Setup

The app works with just `DATABASE_URL`. Optional features need these keys.

### Resend (Email)

1. Go to [resend.com](https://resend.com) → Sign up
2. Navigate to **API Keys** → **Create API Key**
3. Copy the key (starts with `re_...`) and set:
   ```
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   ```

### Google Calendar (Booking Sync)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Library**
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URI: `http://localhost:3000/api/calendar/google/callback`
7. Copy the Client ID and Secret:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxx"
   ```

### Outlook Calendar (Booking Sync)

1. Go to [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**
2. Name: `FlowSync`, Account type: **Personal Microsoft accounts only**
3. Redirect URI: Web → `http://localhost:3000/api/calendar/outlook/callback`
4. Go to **API permissions** → **Add permission** → **Microsoft Graph** → **Delegated** → `Calendars.ReadWrite`
5. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
6. Copy the values:
   ```
   NEXT_PUBLIC_OUTLOOK_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   OUTLOOK_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### Cron Secret (Automation Processing)

```bash
openssl rand -hex 32
```

Set as:
```
CRON_SECRET="your-random-string"
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `RESEND_API_KEY` | No | Resend API key for email sending |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | Google OAuth client ID (public) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `NEXT_PUBLIC_OUTLOOK_CLIENT_ID` | No | Outlook OAuth client ID (public) |
| `OUTLOOK_CLIENT_SECRET` | No | Outlook OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | No | App URL for OAuth redirects (default: `http://localhost:3000`) |
| `CRON_SECRET` | No | Secret to secure the cron endpoint |

## Features

- **Dashboard** — KPI cards, recent bookings, recent invoices
- **Bookings** — CRUD operations, status management, calendar sync, automation triggers
- **Customers** — Contact management, journey timeline (recent bookings + invoices)
- **Invoices** — Create, send, mark paid/overdue, email delivery, automation triggers
- **Automations** — Multi-step email sequences triggered by booking/invoice events
- **Calendar** — Google & Outlook OAuth integration for booking sync
- **Settings** — Business profile, invoice templates, email templates
