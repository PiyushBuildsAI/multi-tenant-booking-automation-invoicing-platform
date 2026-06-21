import { prisma } from "@/lib/prisma"

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const OUTLOOK_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
const OUTLOOK_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

export function getGoogleAuthUrl(tenantId: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    state: tenantId,
  })
  return `${GOOGLE_AUTH_URL}?${params}`
}

export function getOutlookAuthUrl(tenantId: string) {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/outlook/callback`,
    response_type: "code",
    scope: "Calendars.ReadWrite",
    state: tenantId,
  })
  return `${OUTLOOK_AUTH_URL}?${params}`
}

export async function exchangeGoogleCode(code: string, tenantId: string) {
  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`,
      grant_type: "authorization_code",
    }),
  })
  const tokens = await resp.json()

  await prisma.calendarToken.upsert({
    where: { id: `${tenantId}-google` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      provider: "GOOGLE",
    },
    create: {
      id: `${tenantId}-google`,
      provider: "GOOGLE",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      tenantId,
    },
  })
}

export async function syncBookingToGoogleCalendar(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true },
  })
  if (!booking) return

  const token = await prisma.calendarToken.findFirst({
    where: { tenantId: booking.tenantId, provider: "GOOGLE" },
  })
  if (!token) return

  const resp = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: booking.title,
      description: booking.description,
      start: { dateTime: booking.startTime.toISOString() },
      end: { dateTime: booking.endTime.toISOString() },
    }),
  })
  const event = await resp.json()

  await prisma.booking.update({
    where: { id: bookingId },
    data: { externalId: event.id },
  })
}
