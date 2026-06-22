import { prisma } from "@/lib/prisma"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

function getGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? ""
}

function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET ?? ""
}

async function getValidGoogleToken(tenantId: string) {
  const token = await prisma.calendarToken.findFirst({
    where: { tenantId, provider: "GOOGLE" },
  })
  if (!token?.accessToken) return null

  if (token.expiresAt && token.expiresAt < new Date()) {
    if (!token.refreshToken) {
      console.warn(`[calendar] Token expired and no refresh token for tenant ${tenantId}`)
      return null
    }

    const resp = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: getGoogleClientId(),
        client_secret: getGoogleClientSecret(),
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }),
    })
    const data = await resp.json()
    if (data.access_token) {
      await prisma.calendarToken.update({
        where: { id: token.id },
        data: {
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
        },
      })
      return data.access_token
    } else {
      console.error(`[calendar] Failed to refresh Google token:`, data)
    }
    return null
  }

  return token.accessToken
}

export async function exchangeGoogleCode(code: string, tenantId: string) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "")
  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: `${appUrl}/api/calendar/google/callback`,
      grant_type: "authorization_code",
    }),
  })
  const tokens = await resp.json()

  if (tokens.error) {
    throw new Error(`Google OAuth error: ${tokens.error} — ${tokens.error_description ?? ""}`)
  }

  const expiresIn = typeof tokens.expires_in === "number" ? tokens.expires_in : 3600

  await prisma.calendarToken.upsert({
    where: { id: `${tenantId}-google` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      provider: "GOOGLE",
    },
    create: {
      id: `${tenantId}-google`,
      provider: "GOOGLE",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      tenantId,
    },
  })
}

export async function exchangeOutlookCode(code: string, tenantId: string) {
  const resp = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID ?? process.env.OUTLOOK_CLIENT_ID ?? "",
      client_secret: process.env.OUTLOOK_CLIENT_SECRET ?? "",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/outlook/callback`,
      grant_type: "authorization_code",
    }),
  })
  const tokens = await resp.json()
  if (tokens.error) {
    throw new Error(`Outlook OAuth error: ${tokens.error} — ${tokens.error_description ?? ""}`)
  }
  const expiresIn = typeof tokens.expires_in === "number" ? tokens.expires_in : 3600
  await prisma.calendarToken.upsert({
    where: { id: `${tenantId}-outlook` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      provider: "OUTLOOK",
    },
    create: {
      id: `${tenantId}-outlook`,
      provider: "OUTLOOK",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      tenantId,
    },
  })
}

export async function syncBookingToGoogleCalendar(bookingId: string) {
  console.log(`[syncBookingToGoogleCalendar] Starting for booking: ${bookingId}`);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true },
  })
  if (!booking) {
    console.error(`[syncBookingToGoogleCalendar] Booking ${bookingId} not found`);
    return;
  }

  const accessToken = await getValidGoogleToken(booking.tenantId)
  if (!accessToken) {
    console.warn(`[syncBookingToGoogleCalendar] No access token for tenant ${booking.tenantId}`);
    return;
  }

  console.log(`[syncBookingToGoogleCalendar] Got access token, creating event...`);
  const resp = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  console.log(`[syncBookingToGoogleCalendar] Google API response status: ${resp.status}`);
  if (!resp.ok) {
    console.error(`[syncBookingToGoogleCalendar] Error from Google Calendar:`, JSON.stringify(event, null, 2));
  }

  if (event.id) {
    console.log(`[syncBookingToGoogleCalendar] Event created with ID: ${event.id}`);
    await prisma.booking.update({
      where: { id: bookingId },
      data: { externalId: event.id },
    })
  }
}

export async function fetchGoogleCalendarEvents(tenantId: string) {
  const accessToken = await getValidGoogleToken(tenantId)
  if (!accessToken) return 0

  const resp = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
      new URLSearchParams({
        singleEvents: "true",
        orderBy: "startTime",
        timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!resp.ok) return 0

  const data = await resp.json()
  const events: Array<{
    id: string
    summary?: string
    description?: string
    start?: { dateTime?: string }
    end?: { dateTime?: string }
    creator?: { email?: string; displayName?: string }
  }> = data.items ?? []

  let imported = 0

  for (const event of events) {
    if (!event.id || !event.summary || !event.start?.dateTime || !event.end?.dateTime) continue

    const exists = await prisma.booking.findFirst({
      where: { tenantId, externalId: event.id },
    })
    if (exists) continue

    const creatorName = event.creator?.displayName ?? event.creator?.email ?? "Google Calendar"
    const creatorEmail = event.creator?.email ?? `imported-${event.id}@calendar.google.com`

    let customer = await prisma.customer.findFirst({
      where: { tenantId, email: creatorEmail },
    })
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: creatorName, email: creatorEmail, tenantId },
      })
    }

    await prisma.booking.create({
      data: {
        title: event.summary,
        description: event.description ?? null,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        status: "SCHEDULED",
        externalId: event.id,
        tenantId,
        customerId: customer.id,
      },
    })
    imported++
  }

  return imported
}

export async function sendEmailViaGmail(
  to: string,
  subject: string,
  body: string,
  tenantId: string
) {
  const accessToken = await getValidGoogleToken(tenantId)
  if (!accessToken) {
    console.warn("No Google token — cannot send email via Gmail")
    return null
  }

  const raw = [
    `From: FlowSync <me>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    body,
  ].join("\r\n")

  const encoded = Buffer.from(raw, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  const resp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encoded }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    console.error("Gmail send failed:", err)
    return null
  }

  return await resp.json()
}
