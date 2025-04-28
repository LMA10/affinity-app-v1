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

export default function AlertsViewPage() {
  const { alerts, loading, error, fetchAlerts } = useAlertsState()
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
      <div className="flex flex-col h-full">
        <PageHeader
          title="Security Alerts"
          description="Monitor and respond to security alerts across your infrastructure"
        />

        <div className="p-6 space-y-6">
          {/* Severity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0f1d24] border border-orange-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-500">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-red-500">{alertCounts.critical}</span>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d24] border border-orange-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-orange-500">High Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-orange-500">{alertCounts.high}</span>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d24] border border-orange-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-500">Medium Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-yellow-500">{alertCounts.medium}</span>
                  <Shield className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1d24] border border-orange-600/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-500">Low Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-green-500">{alertCounts.low}</span>
                  <Shield className="h-8 w-8 text-green-500" />
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
              {/* Hide Refresh and Filter buttons */}
              {/* <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button> */}
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
