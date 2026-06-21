"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getTenantId } from "@/lib/tenant"
import { syncBookingToGoogleCalendar } from "@/lib/services/calendar"
import { triggerBookingSequences } from "@/lib/services/automation"

export async function createBooking(formData: FormData) {
  const tenantId = await getTenantId()
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const customerId = formData.get("customerId") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string

  const booking = await prisma.booking.create({
    data: {
      title,
      description,
      customerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      tenantId,
    },
  })

  await Promise.allSettled([
    syncBookingToGoogleCalendar(booking.id),
    triggerBookingSequences(booking.id),
  ])

  revalidatePath("/bookings")
  redirect("/bookings")
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: status as any },
  })
  revalidatePath("/bookings")
}

export async function deleteBooking(bookingId: string) {
  await prisma.booking.delete({ where: { id: bookingId } })
  revalidatePath("/bookings")
}
