"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { AlertsTable } from "@/components/alerts/alerts-table"
import { AlertDetailsProvider } from "@/components/alerts/alert-details-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paginator } from "@/components/ui/paginator"
import { Loading } from "@/components/loading"
import { Download, Filter, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"
import useAlertsState from "@/lib/state/alerts/alertsState"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { List } from "lucide-react"

export default function AlertsViewPage() {
  const { alerts, loading, error, fetchAlerts } = useAlertsState()
  const [searchQuery, setSearchQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [status, setStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const itemsPerPage = 10
  const [sortBy, setSortBy] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc")
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)

  // Helper to get initial visible columns from localStorage or default
  const getInitialVisibleColumns = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alerts_visible_columns');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [
      "timestamp",
      "severity",
      "alert",
      "source",
      "status",
      "owner",
      "resolved_by",
      "is_false_positive",
      "last_updated",
      "actions"
    ];
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>(getInitialVisibleColumns)

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Use debouncing for search to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter alerts based on search query and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      debouncedSearch === "" ||
      (alert.metadata?.rule_name && alert.metadata.rule_name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (alert.security_detection?.description &&
        alert.security_detection.description.toLowerCase().includes(debouncedSearch.toLowerCase()))

    const matchesSeverity =
      severity === "all" ||
      (alert.security_detection && alert.security_detection.severity && alert.security_detection.severity.toLowerCase() === severity.toLowerCase())

    // Normalize status for comparison, handle 'False Positive' special case
    const normalizedStatus = (alert.alert_management?.status || "").toLowerCase()
    const normalizedFilter = status.toLowerCase()
    const matchesStatus =
      status === "all" ||
      (normalizedFilter === "false positive"
        ? normalizedStatus === "false_positive"
        : normalizedStatus === normalizedFilter)

    return matchesSearch && matchesSeverity && matchesStatus
  })

  // Sorting logic
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    let aValue, bValue
    switch (sortBy) {
      case "timestamp":
        aValue = a.event?.time || ""
        bValue = b.event?.time || ""
        break
      case "severity":
        aValue = a.security_detection?.severity || ""
        bValue = b.security_detection?.severity || ""
        break
      case "alert":
        aValue = a.metadata?.rule_name || ""
        bValue = b.metadata?.rule_name || ""
        break
      case "source":
        aValue = a.client || ""
        bValue = b.client || ""
        break
      case "status":
        aValue = a.alert_management?.status || ""
        bValue = b.alert_management?.status || ""
        break
      case "owner":
        aValue = a.alert_management?.owner || ""
        bValue = b.alert_management?.owner || ""
        break
      case "resolved_by":
        aValue = a.alert_management?.resolved_by || ""
        bValue = b.alert_management?.resolved_by || ""
        break
      case "is_false_positive":
        aValue = a.alert_management?.is_false_positive ? 1 : 0
        bValue = b.alert_management?.is_false_positive ? 1 : 0
        break
      case "last_updated":
        aValue = a.alert_management?.timestamp || ""
        bValue = b.alert_management?.timestamp || ""
        break
      default:
        aValue = ""
        bValue = ""
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const paginatedAlerts = sortedAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Column selector logic
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
  const toggleColumnVisibility = (column: string) => {
    if (visibleColumns.includes(column)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((col) => col !== column))
      }
    } else {
      setVisibleColumns([...visibleColumns, column])
    }
  }
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchAlerts()
  }

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)

  // Count alerts by severity
  const alertCounts = {
    critical: alerts.filter((alert) => alert.security_detection?.severity?.toLowerCase() === "critical").length,
    high: alerts.filter((alert) => alert.security_detection?.severity?.toLowerCase() === "high").length,
    medium: alerts.filter((alert) => alert.security_detection?.severity?.toLowerCase() === "medium").length,
    low: alerts.filter((alert) => alert.security_detection?.severity?.toLowerCase() === "low").length,
  }

  const cardColors = {
    critical: {
      bg: "bg-[#1a2327] border-[#ff7d2d]",
      text: "text-[#ff7d2d]",
      icon: "text-[#ff7d2d]"
    },
    high: {
      bg: "bg-[#1a2327] border-[#ffb37d]",
      text: "text-[#ffb37d]",
      icon: "text-[#ffb37d]"
    },
    medium: {
      bg: "bg-[#1a2327] border-[#ffd6b3]",
      text: "text-[#ffd6b3]",
      icon: "text-[#ffd6b3]"
    },
    low: {
      bg: "bg-[#1a2327] border-[#ffffff]",
      text: "text-[#ffffff]",
      icon: "text-[#ffffff]"
    }
  }

  // Keep the effect that saves to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alerts_visible_columns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  return (
    <AlertDetailsProvider>
      <div className="flex flex-col h-full">
        <PageHeader
          title="Security Alerts"
          description="Monitor and respond to security alerts across your infrastructure"
        />

        <div className="p-6 space-y-6">
          {/* Severity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`bg-[#1a2327] border ${cardColors.critical.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={cardColors.critical.text}>Crit. Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-4xl font-bold ${cardColors.critical.text}`}>{alertCounts.critical.toString().padStart(2, '0')}</span>
                  <Shield className={`h-8 w-8 ${cardColors.critical.icon}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-[#1a2327] border ${cardColors.high.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={cardColors.high.text}>High Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-4xl font-bold ${cardColors.high.text}`}>{alertCounts.high.toString().padStart(2, '0')}</span>
                  <Shield className={`h-8 w-8 ${cardColors.high.icon}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-[#1a2327] border ${cardColors.medium.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={cardColors.medium.text}>Med. Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-4xl font-bold ${cardColors.medium.text}`}>{alertCounts.medium.toString().padStart(2, '0')}</span>
                  <Shield className={`h-8 w-8 ${cardColors.medium.icon}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-[#1a2327] border ${cardColors.low.bg}`}>
              <CardHeader className="pb-2">
                <CardTitle className={cardColors.low.text}>Low Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-4xl font-bold ${cardColors.low.text}`}>{alertCounts.low.toString().padStart(2, '0')}</span>
                  <Shield className={`h-8 w-8 ${cardColors.low.icon}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." value={searchQuery} onChange={handleSearch} className="pl-10" />
            </div>

            <Select value={severity} onValueChange={(value) => setSeverity(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {/* Column Selector */}
              <Popover open={isColumnSelectorOpen} onOpenChange={setIsColumnSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Visible Columns</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {allColumns.map((col) => (
                        <div key={col.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`column-${col.key}`}
                            checked={visibleColumns.includes(col.key)}
                            onCheckedChange={() => toggleColumnVisibility(col.key)}
                            disabled={visibleColumns.length === 1 && visibleColumns.includes(col.key)}
                          />
                          <Label htmlFor={`column-${col.key}`}>{col.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alerts, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", "alerts.json");
                  document.body.appendChild(dlAnchorElem);
                  dlAnchorElem.click();
                  document.body.removeChild(dlAnchorElem);
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
          ) : (
            <>
              <AlertsTable
                alerts={paginatedAlerts}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                visibleColumns={visibleColumns}
              />
              <div className="flex items-center justify-end mt-4">
                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={filteredAlerts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AlertDetailsProvider>
  )
}
