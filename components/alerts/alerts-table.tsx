"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAlertDetails } from "./alert-details-provider"
import { formatDistanceToNow } from "date-fns"

interface AlertsTableProps {
  alerts: any[]
  onValueClick?: (field: string, value: string) => void
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
  visibleColumns?: string[]
}

export function AlertsTable({ alerts, onValueClick, sortBy, sortDirection, onSort, visibleColumns }: AlertsTableProps) {
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
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-[#ff7d2d]/20 text-[#ff7d2d] border-[#ff7d2d]/20"
      case "high":
        return "bg-[#ffb37d]/20 text-[#ffb37d] border-[#ffb37d]/20"
      case "medium":
        return "bg-[#ffd6b3]/20 text-[#ffd6b3] border-[#ffd6b3]/20"
      case "low":
        return "bg-[#ffffff]/20 text-[#ffffff] border-[#ffffff]/20"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20"
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

  // Define all possible columns
  const allColumns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'severity', label: 'Severity' },
    { key: 'alert', label: 'Alert' },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' },
    { key: 'resolved_by', label: 'Resolved By' },
    { key: 'is_false_positive', label: 'False Positive' },
    { key: 'last_updated', label: 'Last Updated' },
    { key: 'actions', label: 'Actions' },
  ]

  // Determine which columns to show
  const columnsToShow = visibleColumns
    ? allColumns.filter(col => visibleColumns.includes(col.key))
    : allColumns

  // Helper to render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null
    return sortDirection === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <div className="rounded-md border border-orange-600/20 bg-[#0f1d24] relative">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-orange-600/20">
              {columnsToShow.map(col => (
                <TableHead
                  key={col.key}
                  className={col.key === 'actions' ? 'w-[100px] text-right' : col.key === 'timestamp' ? 'w-[180px]' : col.key === 'severity' ? 'w-[100px]' : 'w-[100px]'}
                  onClick={() => col.key !== 'actions' && onSort && onSort(col.key)}
                  style={{ cursor: col.key !== 'actions' ? 'pointer' : undefined }}
                >
                  {col.label}{renderSortIndicator(col.key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnsToShow.length} className="text-center py-8 text-muted-foreground">
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow
                  key={alert.alert_id}
                  className="border-b border-orange-600/10 cursor-pointer hover:bg-orange-600/10 transition"
                  onClick={() => handleViewDetails(alert)}
                >
                  {columnsToShow.map(col => {
                    switch (col.key) {
                      case 'timestamp':
                        return (
                          <TableCell key="timestamp" className="font-mono text-xs">
                            {alert.event?.time
                              ? new Date(alert.event.time).toISOString().replace("T", "\n").substring(0, 19)
                              : "-"}
                          </TableCell>
                        )
                      case 'severity':
                        return (
                          <TableCell key="severity">
                            <Badge
                              variant="outline"
                              className={getSeverityBadgeColor(alert.security_detection?.severity || "unknown")}
                            >
                              {alert.security_detection?.severity
                                ? alert.security_detection.severity.charAt(0).toUpperCase() + alert.security_detection.severity.slice(1).toLowerCase()
                                : "Unknown"}
                            </Badge>
                          </TableCell>
                        )
                      case 'alert':
                        return (
                          <TableCell key="alert" className="font-medium">{alert.metadata?.rule_name || "-"}</TableCell>
                        )
                      case 'source':
                        return <TableCell key="source">{alert.client}</TableCell>
                      case 'status':
                        return <TableCell key="status">{alert.alert_management?.status || "-"}</TableCell>
                      case 'owner':
                        return <TableCell key="owner">{alert.alert_management?.owner || "-"}</TableCell>
                      case 'resolved_by':
                        return <TableCell key="resolved_by">{alert.alert_management?.resolved_by || "-"}</TableCell>
                      case 'is_false_positive':
                        return <TableCell key="is_false_positive">{alert.alert_management?.is_false_positive ? "Yes" : "No"}</TableCell>
                      case 'last_updated':
                        return <TableCell key="last_updated">{alert.alert_management?.timestamp ? new Date(alert.alert_management.timestamp).toLocaleString() : "-"}</TableCell>
                      case 'actions':
                        return (
                          <TableCell key="actions" className="text-right" onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(alert)}>
                              Details
                            </Button>
                          </TableCell>
                        )
                      default:
                        return null
                    }
                  })}
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
          <div className="flex flex-col gap-3 p-3">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="rounded-lg border border-orange-600/20 bg-card p-4 flex flex-col gap-3 shadow-sm active:bg-orange-600/5 transition-colors"
                onClick={() => handleViewDetails(alert)}
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`${getSeverityBadgeColor(alert.security_detection?.severity || "unknown")} text-xs px-2 py-1`}
                  >
                    {alert.security_detection?.severity
                      ? alert.security_detection.severity.charAt(0).toUpperCase() + alert.security_detection.severity.slice(1).toLowerCase()
                      : "Unknown"}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {alert.event?.time
                      ? formatDistanceToNow(new Date(alert.event.time), { addSuffix: true })
                      : "-"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-base line-clamp-2">{alert.metadata?.rule_name || "-"}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {alert.security_detection?.description || "-"}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      alert.alert_management?.status === "open" ? "bg-blue-500/20 text-blue-500" :
                      alert.alert_management?.status === "investigating" ? "bg-purple-500/20 text-purple-500" :
                      alert.alert_management?.status === "resolved" ? "bg-green-500/20 text-green-500" :
                      alert.alert_management?.status === "false_positive" ? "bg-gray-500/20 text-gray-500" :
                      "bg-gray-500/20 text-gray-500"
                    }`}>
                      {alert.alert_management?.status || "Open"}
                    </span>
                    {alert.alert_management?.owner && (
                      <span className="text-xs text-muted-foreground">
                        {alert.alert_management.owner}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={e => { e.stopPropagation(); handleViewDetails(alert); }}
                    className="h-8 px-3 text-xs font-medium"
                  >
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
