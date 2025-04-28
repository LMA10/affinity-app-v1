/**
 * Filters an array of objects by date range
 * @param data Array of objects with a date field
 * @param startDate Start date of the range
 * @param endDate End date of the range
 * @param dateField The field in the data objects that contains the date (default: 'date')
 * @returns Filtered array
 */
export function filterDataByDateRange<T>(
  data: T[],
  startDate: Date,
  endDate: Date,
  dateField: keyof T = "date" as keyof T,
): T[] {
  return data.filter((item) => {
    const itemDate = item[dateField]

    // Handle different date formats
    let date: Date

    if (itemDate instanceof Date) {
      date = itemDate
    } else if (typeof itemDate === "string") {
      date = new Date(itemDate)
    } else if (typeof itemDate === "number") {
      date = new Date(itemDate)
    } else {
      // Skip items without a valid date
      return false
    }

    return date >= startDate && date <= endDate
  })
}

/**
 * Formats a date range as a string
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }

  return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`
}
