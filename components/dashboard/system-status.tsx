"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockSystemStatus } from "@/lib/mock-data"
import { Shield, Server, Clock, AlertTriangle } from "lucide-react"
import { filterDataByDateRange } from "@/lib/services/data-filter-service"
import type { DateRange } from "@/components/date-range-provider"

interface SystemStatusProps {
  dateRange?: DateRange
}

export function SystemStatus({ dateRange }: SystemStatusProps) {
  // Filter system status data based on date range if provided
  const filteredStatus = dateRange
    ? filterDataByDateRange(mockSystemStatus, dateRange, "lastUpdated")
    : mockSystemStatus

  // Get icon component based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield":
        return <Shield className="h-4 w-4" />
      case "server":
        return <Server className="h-4 w-4" />
      case "clock":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500"
      case "degraded":
        return "text-yellow-500"
      case "down":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="bg-[#0f1d24] border-orange-600/20">
      <CardHeader>
        <CardTitle className="text-orange-500">System Status</CardTitle>
        <CardDescription>Current status of security systems</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredStatus.map((system) => (
            <div key={system.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-[#0a1419] p-2 rounded-md">{getIcon(system.icon)}</div>
                <div>
                  <div className="font-medium">{system.name}</div>
                  <div className="text-xs text-muted-foreground">{system.description}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`font-medium ${getStatusColor(system.status)}`}>
                  {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground">Uptime: {system.uptime}</div>
              </div>
            </div>
          ))}

          {filteredStatus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No system status data for the selected time period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
