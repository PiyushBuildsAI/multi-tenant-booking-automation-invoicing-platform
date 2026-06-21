"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateTimePickerProps {
  name: string
  label: string
  required?: boolean
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const minutes = ["00", "15", "30", "45"]

export function DateTimePicker({ name, label, required }: DateTimePickerProps) {
  const [date, setDate] = useState<Date>()
  const [hour, setHour] = useState("09")
  const [minute, setMinute] = useState("00")

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={date ? `${format(date, "yyyy-MM-dd")}T${hour}:${minute}` : ""} />
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger className={cn("flex-1 justify-start text-left font-normal inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground", !date && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
        <Select value={hour} onValueChange={(v) => v && setHour(v)}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center text-zinc-400">:</span>
        <Select value={minute} onValueChange={(v) => v && setMinute(v)}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
