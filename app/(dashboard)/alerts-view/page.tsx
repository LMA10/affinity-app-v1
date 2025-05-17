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
import { Download, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import useAlertsState from "@/lib/state/alerts/alertsState"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { AlertCard } from "@/components/alerts/alert-card"

export default function AlertsViewPage() {
  const { alerts, loading, error, fetchAlerts } = useAlertsState()
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'light' ? 'light' : 'dark'
  const [searchQuery, setSearchQuery] = useState("")
  const [severity, setSeverity] = useState("all")
  const [status, setStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const itemsPerPage = 10

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
      severity === "all" || (alert.security_detection && alert.security_detection.severity === severity)

    const matchesStatus = status === "all" || (alert.alert_management && alert.alert_management.status === status)

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRefresh = () => {
    fetchAlerts()
  }

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Count alerts by severity
  const alertCounts = {
    critical: alerts.filter((alert) => alert.security_detection?.severity === "critical").length,
    high: alerts.filter((alert) => alert.security_detection?.severity === "high").length,
    medium: alerts.filter((alert) => alert.security_detection?.severity === "medium").length,
    low: alerts.filter((alert) => alert.security_detection?.severity === "low").length,
  }

  return (
    <AlertDetailsProvider>
      <div className="flex flex-col h-full bg-[#E8E8E8] dark:bg-[#0E1A1F]">
        <div className="px-12 py-4">
          <div className="flex justify-between items-center">
            <div style={{ 
              color: theme === 'light' ? '#506C77' : '#506C77', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontWeight: 400, 
              fontSize: '12.3px', 
              marginBottom: 0,
              lineHeight: '13px'
            }}>
              <span style={{ color: theme === 'light' ? '#FF7120' : '#EA661B', fontWeight: 700, fontSize: 13 }}>Security Alerts</span> / monitor and respond to security alerts across your infrastructure
            </div>
            <div style={{ color: '#0C2027' }}>
              <div style={{ color: '#0C2027' }}>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 py-0 -mt-0 space-y-3">
          {/* Severity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AlertCard type="critical" count={alertCounts.critical} displayText="Crit." />
            <AlertCard type="high" count={alertCounts.high} />
            <AlertCard type="medium" count={alertCounts.medium} displayText="Med." />
            <AlertCard type="low" count={alertCounts.low}/>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#0C2027] dark:text-white" />
              <Input placeholder="Search alerts..." value={searchQuery} onChange={handleSearch} className="pl-10 !bg-[#CAD0D2] dark:!bg-[#0D1315] !border-none !text-[#506C77] dark:!text-white placeholder-[#506C77] dark:placeholder-white" />
            </div>

            <Select value={severity} onValueChange={(value) => setSeverity(value)}>
              <SelectTrigger className="w-full sm:w-[180px] !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77]">
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
              <SelectTrigger className="w-full sm:w-[180px] !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77]">
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
              <Button
                variant="outline"
                size="icon"
                className="!bg-[#CAD0D2] dark:!bg-[#0D1315] !border !border-[#506C77]"
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
                <Download className="h-4 w-4 text-[#506C77]" />
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
              <AlertsTable alerts={paginatedAlerts} />
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
