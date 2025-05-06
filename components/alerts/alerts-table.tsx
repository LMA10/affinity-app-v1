"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAlertDetails } from "./alert-details-provider"
import { formatDistanceToNow } from "date-fns"

interface AlertsTableProps {
  alerts: any[]
  onValueClick?: (field: string, value: string) => void
}

export function AlertsTable({ alerts, onValueClick }: AlertsTableProps) {
  const { setSelectedAlert, setIsOpen, selectedAlert, isOpen } = useAlertDetails()

  const handleViewDetails = (alert: any) => {
    if (isOpen && selectedAlert && selectedAlert.alert_id === alert.alert_id) {
      setIsOpen(false)
      setSelectedAlert(null)
    } else {
      setSelectedAlert(alert)
      setIsOpen(true)
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white border-red-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "high":
        return "bg-orange-500 text-white border-orange-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "medium":
        return "bg-yellow-500 text-white border-yellow-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "low":
        return "bg-green-500 text-white border-green-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      default:
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500 text-white border-blue-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "investigating":
        return "bg-[#00AAE5] text-white border-[#00AAE5] font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "resolved":
        return "bg-green-500 text-white border-green-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      case "false_positive":
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
      default:
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[2px]"
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    try {
      const date = new Date(timeString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return timeString
    }
  }

  return (
    <div className="rounded-md border bg-[#CAD0D2] dark:bg-[#0D1315] relative">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead>Alert</TableHead>
              <TableHead className="w-[100px]">Source</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert, idx) => (
                <TableRow
                  key={alert.alert_id}
                  className={`border-b cursor-pointer hover:bg-orange-600/10 transition 
                    ${idx % 2 === 0 ? 'bg-[#E8E8E8] dark:bg-[#142A33]' : 'bg-[#CAD0D2] dark:bg-[#0D1315]'}`}
                  onClick={() => handleViewDetails(alert)}
                >
                  <TableCell className="font-mono text-xs">
                    {alert.event?.time
                      ? new Date(alert.event.time).toISOString().replace("T", "\n").substring(0, 19)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getSeverityBadgeColor(alert.security_detection?.severity || "unknown")}
                    >
                      {alert.security_detection?.severity || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{alert.metadata?.rule_name || "-"}</TableCell>
                  <TableCell>{alert.client}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(alert.alert_management?.status || "unknown")}
                    >
                      {alert.alert_management?.status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card/List Layout */}
      <div className="block md:hidden">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No alerts found</div>
        ) : (
          <div className="flex flex-col gap-4 p-2">
            {alerts.map((alert, idx) => (
              <div
                key={alert.alert_id}
                className={`rounded-lg border p-4 flex flex-col gap-2 shadow-sm 
                  ${idx % 2 === 0 ? 'bg-[#E8E8E8] dark:bg-[#142A33]' : 'bg-[#CAD0D2] dark:bg-[#0D1315]'}`}
                onClick={() => handleViewDetails(alert)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">
                    {alert.event?.time
                      ? new Date(alert.event.time).toISOString().replace("T", " ").substring(0, 19)
                      : "-"}
                  </span>
                  <Badge
                    variant="outline"
                    className={getSeverityBadgeColor(alert.security_detection?.severity || "unknown")}
                  >
                    {alert.security_detection?.severity || "unknown"}
                  </Badge>
                </div>
                <div className="font-medium text-base truncate">{alert.metadata?.rule_name || "-"}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className={getStatusBadgeColor(alert.alert_management?.status || "unknown")}
                  >
                    {alert.alert_management?.status || "unknown"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); handleViewDetails(alert); }}>
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
