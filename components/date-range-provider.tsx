"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { subDays, startOfDay, endOfDay } from "date-fns"

interface DateRange {
  start: Date
  end: Date
  label: string
}

interface DateRangeContextType {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  predefinedRanges: { label: string; value: string; range: () => DateRange }[]
  setPredefinedRange: (value: string) => void
}

// Default date range: last 24 hours
const defaultDateRange: DateRange = {
  start: startOfDay(subDays(new Date(), 1)),
  end: endOfDay(new Date()),
  label: "Last 24 hours",
}

// Predefined date ranges
const predefinedRanges = [
  {
    label: "Last 24 hours",
    value: "24h",
    range: () => ({
      start: startOfDay(subDays(new Date(), 1)),
      end: endOfDay(new Date()),
      label: "Last 24 hours",
    }),
  },
  {
    label: "Last 7 days",
    value: "7d",
    range: () => ({
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date()),
      label: "Last 7 days",
    }),
  },
  {
    label: "Last 30 days",
    value: "30d",
    range: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: endOfDay(new Date()),
      label: "Last 30 days",
    }),
  },
  {
    label: "Last 90 days",
    value: "90d",
    range: () => ({
      start: startOfDay(subDays(new Date(), 90)),
      end: endOfDay(new Date()),
      label: "Last 90 days",
    }),
  },
]

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined)

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  // Function to set a predefined range by value
  const setPredefinedRange = (value: string) => {
    const rangeConfig = predefinedRanges.find((r) => r.value === value)
    if (rangeConfig) {
      setDateRange(rangeConfig.range())
    }
  }

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      const savedRange = localStorage.getItem("dateRange")
      if (savedRange) {
        const parsed = JSON.parse(savedRange)
        setDateRange({
          start: new Date(parsed.start),
          end: new Date(parsed.end),
          label: parsed.label,
        })
      }
    } catch (error) {
      //console.error("Error loading date range from localStorage:", error)
    }
  }, [])

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(
        "dateRange",
        JSON.stringify({
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
          label: dateRange.label,
        }),
      )
    } catch (error) {
      //console.error("Error saving date range to localStorage:", error)
    }
  }, [dateRange])

  return (
    <DateRangeContext.Provider
      value={{
        dateRange,
        setDateRange,
        predefinedRanges,
        setPredefinedRange,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  )
}

export function useDateRange() {
  const context = useContext(DateRangeContext)
  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider")
  }
  return context
}

export type { DateRange }
