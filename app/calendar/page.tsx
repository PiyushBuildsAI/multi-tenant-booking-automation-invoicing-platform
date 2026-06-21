"use client"

import { Card, Button, Chip } from "@heroui/react"

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Calendar Integration</h1>
      <p className="text-zinc-500">Connect Google Calendar or Outlook to sync bookings.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card.Root className="p-5">
          <Card.Header>
            <Card.Title>Google Calendar</Card.Title>
            <Card.Description>Sync events and automate booking creation.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Button>Connect</Button>
          </Card.Content>
        </Card.Root>
        <Card.Root className="p-5">
          <Card.Header>
            <Card.Title>Outlook Calendar</Card.Title>
            <Card.Description>Sync events and automate booking creation.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Button>Connect</Button>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  )
}
