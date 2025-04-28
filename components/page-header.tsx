"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Filter, RefreshCw, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DateRangeModal } from "@/components/date-range-modal"
import { useDateRange } from "@/components/date-range-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

// Pages where we don't want to show the action buttons
const EXCLUDED_PAGES = [
  "/logs",
  "/alerts",
  "/wiki",
  "/legal",
  "/analytics",
  "/analytics/azure",
  "/analytics/aws",
  "/analytics/gcp",
  "/analytics/github",
  "/cloud/aws",
  "/cloud/github",
  "/cloud/azure",
  "/cloud/gcp",
  "/management/users",
  "/management/integrations",
  "/management/notifications",
  "/management/agents",
]

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { dateRange, setDateRange, predefinedRanges, setPredefinedRange } = useDateRange()
  const pathname = usePathname()

  // Check if the current page should show action buttons
  const shouldShowActions = !EXCLUDED_PAGES.some((page) => pathname?.startsWith(page))

  // Handle refresh button click
  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  // Format date range for display
  const formattedDateRange = `${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d, yyyy")}`

  return (
    <div className="border-b border-orange-600/20 dark:bg-[#0f1d24] light:bg-white w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-orange-500 dark:text-orange-500 light:text-orange-600">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          {actions || (
            <>
              {shouldShowActions && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="hidden md:flex">
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.label || formattedDateRange}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {predefinedRanges.map((range) => (
                        <DropdownMenuItem key={range.value} onClick={() => setPredefinedRange(range.value)}>
                          {range.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem onClick={() => setIsDateRangeModalOpen(true)}>Custom Range...</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
              <ThemeToggle />
            </>
          )}
        </div>
      </div>

      <DateRangeModal
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
        onApply={setDateRange}
        initialRange={dateRange}
      />
    </div>
  )
}
