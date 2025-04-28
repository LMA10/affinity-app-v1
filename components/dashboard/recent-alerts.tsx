"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, ArrowRight, Shield, ShieldAlert, ShieldX } from "lucide-react"
import { enhancedMockAlerts } from "@/lib/mock-data/enhanced-alerts"
import { useAlertDetails } from "@/components/alert-details-provider"
import { useDateRange } from "@/components/date-range-provider"
import { filterByDateRange } from "@/lib/services/data-filter-service"

interface RecentAlertsProps {
  showAll?: boolean
}

export function RecentAlerts({ showAll = false }: RecentAlertsProps) {
  const { dateRange } = useDateRange()
  const { setSelectedAlert, setIsOpen } = useAlertDetails()
  const [filteredAlerts, setFilteredAlerts] = useState(enhancedMockAlerts)
  const [loading, setLoading] = useState(false)

  // Filter alerts based on the selected date range
  useEffect(() => {
    setLoading(true)

    // Short delay to simulate data fetching
    setTimeout(() => {
      const filtered = filterByDateRange(enhancedMockAlerts, dateRange.start, dateRange.end, "timestamp")

      setFilteredAlerts(filtered)
      setLoading(false)
    }, 300)
  }, [dateRange])

  // Get the most recent alerts or all alerts based on the showAll prop
  const alertsToShow = showAll ? filteredAlerts : filteredAlerts.slice(0, 5)

  const handleViewDetails = (alert: any) => {
    setSelectedAlert(alert)
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : alertsToShow.length === 0 ? (
        <div className="text-center py-8 border rounded-md border-orange-600/10 bg-[#0a1419]">
          <p className="text-muted-foreground">No alerts found for the selected time period.</p>
        </div>
      ) : (
        <>
          {alertsToShow.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start space-x-4 rounded-md border border-orange-600/10 bg-[#0a1419] p-4"
            >
              <div className="mt-0.5">
                {alert.severity === "critical" ? (
                  <ShieldX className="h-5 w-5 text-red-500" />
                ) : alert.severity === "high" ? (
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                ) : alert.severity === "medium" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Shield className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      alert.severity === "critical"
                        ? "bg-red-500/20 text-red-500"
                        : alert.severity === "high"
                          ? "bg-orange-500/20 text-orange-500"
                          : alert.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{alert.source}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleViewDetails(alert)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {!showAll && filteredAlerts.length > 0 && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/alerts">
            View All Alerts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
