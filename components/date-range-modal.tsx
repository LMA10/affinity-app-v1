"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, startOfDay, endOfDay } from "date-fns"
import { useDateRange } from "@/components/date-range-provider"

interface DateRangeModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (range: { start: Date; end: Date; label: string }) => void
  initialRange?: { start: Date; end: Date; label: string }
}

export function DateRangeModal({ isOpen, onClose, onApply, initialRange }: DateRangeModalProps) {
  const { predefinedRanges } = useDateRange()
  const [activeTab, setActiveTab] = useState<string>("24h")
  const [startDate, setStartDate] = useState<Date | undefined>(initialRange?.start || new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(initialRange?.end || new Date())

  // Update local state when initialRange changes
  useEffect(() => {
    if (initialRange) {
      setStartDate(initialRange.start)
      setEndDate(initialRange.end)

      // Try to find the matching predefined range
      const matchingRange = predefinedRanges.find((range) => {
        const { start, end } = range.range()
        return (
          start.getDate() === initialRange.start.getDate() &&
          start.getMonth() === initialRange.start.getMonth() &&
          start.getFullYear() === initialRange.start.getFullYear() &&
          end.getDate() === initialRange.end.getDate() &&
          end.getMonth() === initialRange.end.getMonth() &&
          end.getFullYear() === initialRange.end.getFullYear()
        )
      })

      if (matchingRange) {
        setActiveTab(matchingRange.value)
      } else {
        setActiveTab("custom")
      }
    }
  }, [initialRange, predefinedRanges])

  // Handle predefined range selection
  const handlePredefinedRangeSelect = (value: string) => {
    setActiveTab(value)

    if (value !== "custom") {
      const rangeConfig = predefinedRanges.find((r) => r.value === value)
      if (rangeConfig) {
        const { start, end } = rangeConfig.range()
        setStartDate(start)
        setEndDate(end)
      }
    }
  }

  // Handle apply button click
  const handleApply = () => {
    if (startDate && endDate) {
      const label =
        activeTab === "custom"
          ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
          : predefinedRanges.find((range) => range.value === activeTab)?.label || ""

      onApply({
        start: startOfDay(startDate),
        end: endOfDay(endDate),
        label,
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>Choose a predefined range or select a custom date range.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handlePredefinedRangeSelect} className="mt-4">
          {/* Improved spacing between tab options */}
          <TabsList className="grid w-full grid-cols-5 gap-2 mb-4">
            {predefinedRanges.map((range) => (
              <TabsTrigger
                key={range.value}
                value={range.value}
                className="px-2 py-1.5 text-xs sm:text-sm whitespace-nowrap"
              >
                {range.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="custom" className="px-2 py-1.5 text-xs sm:text-sm whitespace-nowrap">
              Custom Range
            </TabsTrigger>
          </TabsList>

          {/* Custom range content with improved layout */}
          <TabsContent value="custom" className="mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-medium">Start Date</h4>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                    className="w-full"
                    styles={{
                      caption: { fontSize: "0.875rem" },
                      day: { width: "2rem", height: "2rem", fontSize: "0.875rem" },
                      head_cell: { width: "2rem", fontSize: "0.75rem" },
                      table: { width: "100%" },
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-medium">End Date</h4>
                <div className="border rounded-md p-1">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                    className="w-full"
                    styles={{
                      caption: { fontSize: "0.875rem" },
                      day: { width: "2rem", height: "2rem", fontSize: "0.875rem" },
                      head_cell: { width: "2rem", fontSize: "0.75rem" },
                      table: { width: "100%" },
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Predefined range content */}
          {predefinedRanges.map((range) => (
            <TabsContent key={range.value} value={range.value} className="mt-4">
              <div className="p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">
                  {range.label}:{" "}
                  {startDate && endDate
                    ? `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
                    : ""}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Range</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
