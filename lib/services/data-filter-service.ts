import { format, isAfter, isBefore, isEqual, parseISO } from "date-fns"
import type { DateRange } from "@/components/date-range-provider"

/**
 * Filters an array of objects by date range
 * @param data Array of objects with a date field
 * @param startDate Start date of the range
 * @param endDate End date of the range
 * @param dateField The field in the data objects that contains the date (default: 'timestamp')
 * @returns Filtered array
 */
export function filterByDateRange<T extends Record<string, any>>(
  data: T[],
  startDate: Date,
  endDate: Date,
  dateField: keyof T = "timestamp" as keyof T,
): T[] {
  return data.filter((item) => {
    // Get the date value from the item
    const dateValue = item[dateField]

    // Skip items without a date field
    if (!dateValue) return false

    // Parse the date based on its type
    let itemDate: Date

    if (typeof dateValue === "object" && dateValue !== null && (dateValue as unknown) instanceof Date) {
      itemDate = dateValue
    } else if (typeof dateValue === "string") {
      // Handle different string date formats
      try {
        if (dateValue.includes("T")) {
          // ISO format
          itemDate = parseISO(dateValue)
        } else {
          // Try to parse other formats
          itemDate = new Date(dateValue)
        }
      } catch (error) {
        return false
      }
    } else if (typeof dateValue === "number") {
      // Timestamp in milliseconds
      itemDate = new Date(dateValue)
    } else {
      return false
    }

    // Check if the date is within the range (inclusive)
    return (
      (isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) &&
      (isBefore(itemDate, endDate) || isEqual(itemDate, endDate))
    )
  })
}

/**
 * Filters an array of objects by date range using a DateRange object
 * @param data Array of objects with a date field
 * @param dateRange DateRange object with start and end dates
 * @param dateField The field in the data objects that contains the date (default: 'timestamp')
 * @returns Filtered array
 */
export function filterDataByDateRange<T extends Record<string, any>>(
  data: T[],
  dateRange: DateRange | { start: Date; end: Date },
  dateField: keyof T = "timestamp" as keyof T,
): T[] {
  return filterByDateRange(data, dateRange.start, dateRange.end, dateField)
}

/**
 * Formats a date for display
 * @param date Date to format
 * @param formatString Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatString = "MMM d, yyyy"): string {
  return format(date, formatString)
}

/**
 * Calculates the percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Gets data for a previous time period of the same duration
 * @param data Full dataset
 * @param currentStartDate Start date of current period
 * @param currentEndDate End date of current period
 * @param dateField Field containing the date
 * @returns Data from the previous period
 */
export function getPreviousPeriodData<T extends Record<string, any>>(
  data: T[],
  currentStartDate: Date,
  currentEndDate: Date,
  dateField: keyof T = "timestamp" as keyof T,
): T[] {
  // Calculate the duration of the current period in milliseconds
  const periodDuration = currentEndDate.getTime() - currentStartDate.getTime()

  // Calculate the previous period dates
  const previousEndDate = new Date(currentStartDate.getTime() - 1) // 1ms before current start
  const previousStartDate = new Date(previousEndDate.getTime() - periodDuration)

  // Filter data for the previous period
  return filterByDateRange(data, previousStartDate, previousEndDate, dateField)
}

/**
 * Filter analytics data based on date range
 * @param data Analytics data object
 * @param dateRange Date range to filter by
 * @returns Filtered analytics data
 */
export function filterAnalyticsData(data: any, dateRange: DateRange): any {
  // Filter events over time
  const filteredEventsOverTime = data.eventsOverTime
    ? filterDataByDateRange(data.eventsOverTime, dateRange, "date")
    : []

  // Filter top events
  const filteredTopEvents = data.topEvents ? filterDataByDateRange(data.topEvents, dateRange, "date") : []

  // For simplicity, we're not filtering the platform distribution and incident types
  // In a real app, you might want to recalculate these based on the filtered data

  return {
    ...data,
    eventsOverTime: filteredEventsOverTime,
    topEvents: filteredTopEvents,
    // Adjust total counts based on filtered data (simplified approach)
    totalEvents: filteredEventsOverTime.reduce((sum: number, item: any) => sum + item.events, 0),
    securityIncidents: Math.round(
      data.securityIncidents * (filteredEventsOverTime.length / data.eventsOverTime.length),
    ),
  }
}
