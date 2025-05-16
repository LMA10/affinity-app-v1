"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { Loading } from "@/components/loading"
import {
  Download,
  Code,
  List,
  ChevronDown,
  ChevronRight,
  FileDown,
  Copy,
  ChevronUp,
  Database,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react"
import { QueryEditor } from "@/components/logs/query-editor"
import { Badge } from "@/components/ui/badge"
import { LogDetailsView } from "@/components/logs/log-details-view"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { ChangeEvent } from "react"
import { Paginator } from "@/components/ui/paginator"
import useLogsState from "@/lib/state/logs/logsState"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")
  const [loading, setLoading] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "query">("table")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{ field: string; value: string }[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const { toast } = useToast()
  const {
    logs,
    headers,
    totalRows,
    recordsPerPage,
    loading: logsLoading,
    error,
    currentPage,
    nextToken,
    fetchLogs,
    fetchNextPage,
    fetchPreviousPage,
    fetchDatabases,
    setCurrentPage,
  } = useLogsState()
  const [hasRunQuery, setHasRunQuery] = useState(false)
  const { theme } = useTheme()

  // Fetch databases when the component mounts
  useEffect(() => {
    fetchDatabases()

    // Check if we're coming from an alert (with a stored query)
    const hasStoredQuery = typeof window !== "undefined" && localStorage.getItem("affinity_stored_query")
    if (hasStoredQuery) {
      setViewMode("query")
    }
  }, [fetchDatabases])

  // Use debouncing for search to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update visible columns when logs or headers change
  useEffect(() => {
    if (headers.length > 0) {
      // Get the first 5 columns or all if less than 5
      const firstFiveColumns = headers.slice(0, 5)
      setVisibleColumns(firstFiveColumns)
    }
  }, [headers])

  // Utility to normalize field names (case-insensitive, remove spaces, etc.)
  function normalizeFieldName(name: string) {
    return name.replace(/\s+/g, '').toLowerCase();
  }

  // Utility to flatten nested objects (e.g., { useridentity: { type: "AWSService" } } => { "useridentity.type": "AWSService" })
  function flattenObject(obj: any, prefix = ""): Record<string, any> {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : ""
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k))
      } else {
        acc[pre + k] = obj[k]
      }
      return acc
    }, {} as Record<string, any>)
  }

  // Filter logs based on search query, status filter, and active filters
  const filterLogs = useCallback(() => {
    const filtered = logs.filter((log) => {
      const flatLog = flattenObject(log)
      // Check if log matches the search query
      const matchesSearch =
        debouncedSearch === "" ||
        Object.entries(flatLog).some(([key, value]) => {
          if (value === null) return false
          const stringValue = String(value).toLowerCase()
          const searchLower = debouncedSearch.toLowerCase()
          return stringValue.includes(searchLower)
        })

      // Check if log matches the status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "error" && ["500", "503", "504"].includes(String(flatLog.albstatuscode))) ||
        (statusFilter === "warning" && ["400", "401", "403", "404"].includes(String(flatLog.albstatuscode))) ||
        (statusFilter === "info" && ["200", "201", "204"].includes(String(flatLog.albstatuscode)))

      // Check if log matches all active filters
      const matchesActiveFilters =
        activeFilters.length === 0 ||
        activeFilters.every((filter) => {
          // Normalize both filter field and log keys
          const normalizedFilterField = normalizeFieldName(filter.field)
          const logKey = Object.keys(flatLog).find(
            (k) => normalizeFieldName(k) === normalizedFilterField
          )
          if (!logKey || flatLog[logKey] === null) return false
          const logValue = String(flatLog[logKey]).toLowerCase()
          const filterValue = filter.value.toLowerCase()
          return logValue === filterValue
        })

      return matchesSearch && matchesStatus && matchesActiveFilters
    })

    setFilteredLogs(filtered)
  }, [logs, debouncedSearch, statusFilter, activeFilters])

  // Apply filters whenever relevant state changes
  useEffect(() => {
    filterLogs()
  }, [filterLogs, logs, debouncedSearch, statusFilter, activeFilters])

  // Calculate total pages based on total rows and records per page
  const totalPages = Math.ceil(totalRows / recordsPerPage)

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handleRefresh = async () => {
    if (!hasRunQuery) {
      toast({
        title: "No query to refresh",
        description: "Please run a query first",
        duration: 2000,
      })
      return
    }

    setLoading(true)
    try {
      await fetchLogs('SELECT * FROM "cloudtrail" LIMIT 10')
      toast({
        title: "Logs refreshed",
        description: "The logs have been refreshed successfully",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error refreshing logs",
        description: "An error occurred while refreshing logs",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle expanded row
  const toggleRowExpansion = (logId: number) => {
    if (expandedLogId === String(logId)) {
      setExpandedLogId(null)
    } else {
      setExpandedLogId(String(logId))
    }
  }

  // When clicking a value, use the normalized field name from the log object
  const handleValueClick = (field: string, value: string) => {
    // Find the actual log key that matches the normalized field
    const normalizedField = normalizeFieldName(field)
    const logKey = headers.find((h) => normalizeFieldName(h) === normalizedField) || field
    // Add the field-value pair to active filters if it's not already there
    const filterExists = activeFilters.some((filter) => filter.field === logKey && filter.value === value)
    if (!filterExists) {
      const newFilters = [...activeFilters, { field: logKey, value }]
      setActiveFilters(newFilters)
    }
    setCurrentPage(1)
  }

  // Remove a filter
  const removeFilter = (field: string, value: string) => {
    const newFilters = activeFilters.filter((filter) => !(filter.field === field && filter.value === value))
    setActiveFilters(newFilters)
    setCurrentPage(1) // Reset to first page when removing a filter
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([])
    setSearchQuery("")
    setDebouncedSearch("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // Export logs to CSV
  const exportToCSV = () => {
    if (!hasRunQuery || filteredLogs.length === 0) {
      toast({
        title: "No data to export",
        description: "Please run a query first",
        duration: 2000,
      })
      return
    }

    // Determine which logs to export (filtered or all)
    const logsToExport = filteredLogs

    // Create CSV header
    const csvHeader = visibleColumns.join(",")

    // Create CSV rows
    const csvRows = logsToExport.map((log) => {
      return visibleColumns
        .map((column) => {
          // Handle null values and escape commas in values
          const value = log[column] === null ? "" : String(log[column])
          return `"${value.replace(/"/g, '""')}"`
        })
        .join(",")
    })

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `logs_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `${logsToExport.length} logs exported to CSV`,
      duration: 2000,
    })
  }

  // Export selected log to JSON
  const exportLogToJSON = (log: any) => {
    const jsonContent = JSON.stringify(log, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `log_${log.traceid || new Date().toISOString()}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Log exported to JSON",
      duration: 2000,
    })
  }

  // Copy log to clipboard
  const copyLogToClipboard = (log: any) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
    toast({
      title: "Copied to clipboard",
      description: "Log data copied to clipboard",
      duration: 2000,
    })
  }

  // Toggle column visibility
  const toggleColumnVisibility = (column: string) => {
    if (visibleColumns.includes(column)) {
      // Don't remove if it's the last visible column
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((col) => col !== column))
      }
    } else {
      setVisibleColumns([...visibleColumns, column])
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    const statusCode = Number(status)
    if (statusCode >= 500) return "bg-red-500/20 text-red-500 border-red-500/20"
    if (statusCode >= 400) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
    if (statusCode >= 300) return "bg-blue-500/20 text-blue-500 border-blue-500/20"
    if (statusCode >= 200) return "bg-green-500/20 text-green-500 border-green-500/20"
    return "bg-gray-500/20 text-gray-500 border-gray-500/20"
  }

  // Handle query run
  const handleQueryRun = (query: string) => {
    // Reset pagination when a new query is run
    setCurrentPage(1)
    setHasRunQuery(true)
  }

  const handleViewDetails = (log: any) => {
    setSelectedLog(log)
    setExpandedLogId(String(logs.indexOf(log)))
  }

  const handleDeleteLog = (log: any) => {
    setSelectedLog(log)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteLog = async () => {
    if (selectedLog) {
      try {
        // Add your delete logic here
        setIsDeleteDialogOpen(false)
        setSelectedLog(null)
      } catch (error) {
        console.error('Error deleting log:', error)
      }
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme === 'dark' ? '#0E1A1F' : '#E5E5E5' }}>
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
            <span style={{ color: theme === 'light' ? '#FF7120' : '#EA661B', fontWeight: 700, fontSize: 13 }}>Security Logs</span> / view and analyze security event logs across your infrastructure
          </div>
          <div style={{ color: '#0C2027' }}>
            <div style={{ color: '#0C2027' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="pl-12 pr-6 pt-0 space-y-3">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex w-full items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#0D1315] dark:text-white" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 !bg-[#CAD0D2] dark:!bg-[#0D1315] !border-none !text-[#506C77] dark:!text-white placeholder-[#506C77] dark:placeholder-white rounded-[8px] h-10"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              />
            </div>
            <div className="flex items-center">
              <div className="flex bg-transparent p-0.5">
                <button
                  className={`flex items-center px-4 py-2 h-10 font-normal font-['Helvetica','Arial',sans-serif] text-sm focus:outline-none transition-colors
                    ${viewMode === 'table'
                      ? 'bg-[#506C77] text-white'
                      : 'bg-[#CAD0D2] text-[#506C77] dark:bg-[#0D1315] dark:text-[#CAD0D2]'}
                    rounded-l-[8px] border-0
                  `}
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table view
                </button>
                <button
                  className={`flex items-center px-4 py-2 h-10 font-normal font-['Helvetica','Arial',sans-serif] text-sm focus:outline-none transition-colors
                    ${viewMode === 'query'
                      ? 'bg-[#506C77] text-white'
                      : 'bg-[#CAD0D2] text-[#506C77] dark:bg-[#0D1315] dark:text-[#CAD0D2]'}
                    rounded-r-[8px] -ml-px border-0
                  `}
                  onClick={() => setViewMode('query')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Query editor
                </button>
              </div>
            </div>
            <div className="flex gap-2 items-center h-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 !bg-[#CAD0D2] dark:!bg-[#0D1315] !border !border-[#64828E] flex items-center justify-center">
                    <Download className="h-5 w-5 text-[#64828E]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV()}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export filtered logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover open={isColumnSelectorOpen} onOpenChange={setIsColumnSelectorOpen}>
                <PopoverTrigger asChild>
                  <button className="h-10 w-10 flex items-center justify-center bg-[#CAD0D2] dark:bg-[#0D1315] border border-[#64828E] rounded-[8px] text-[#64828E] hover:bg-[#e0e4e5] dark:hover:bg-[#182325] transition">
                    <List className="h-5 w-5 text-[#64828E]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div>
                    <h4 className="font-medium">Visible Columns</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {headers.map((header) => (
                        <div key={header} className="flex items-center space-x-2">
                          <Checkbox
                            id={`column-${header}`}
                            checked={visibleColumns.includes(header)}
                            onCheckedChange={() => toggleColumnVisibility(header)}
                            disabled={visibleColumns.length === 1 && visibleColumns.includes(header)}
                          />
                          <Label htmlFor={`column-${header}`}>{header}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={`${filter.field}-${filter.value}-${index}`}
                variant="outline"
                className="bg-orange-500/10 text-orange-500 border-orange-500/20"
              >
                {filter.field}: {filter.value}
                <button onClick={() => removeFilter(filter.field, filter.value)} className="ml-1 hover:text-orange-300">
                  ×
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7">
              Clear all
            </Button>
          </div>
        )}

        {viewMode === "query" && (
          <div className="mb-6">
            <QueryEditor onRunQuery={handleQueryRun} />
          </div>
        )}

        {viewMode === "table" && !hasRunQuery ? (
          <div className="rounded-md border bg-[#0f1d24] p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl mb-4 font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#FF7120' }}>No logs to display</h3>
            <p className="max-w-md mb-8" style={{ fontFamily: 'IBM Plex Mono', color: '#CAD0D2', fontWeight: 100, fontSize: '13px' }}>
              Use the Query Editor to search and analyze your security logs. Write a SQL query to get started.
            </p>
            <Button
              variant="default"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => setViewMode("query")}
            >
              <Code className="h-4 w-4 mr-2" />
              Open Query Editor
            </Button>
          </div>
        ) : hasRunQuery ? (
          <div className="rounded-md border bg-[#0f1d24] relative">
            {(loading || logsLoading) && <Loading className="absolute right-4 top-4" />}

            {/* Paginator only (no summary or selector) */}
            {logs.length > 0 && (
              <div className="flex items-center justify-center px-2 py-2 md:px-4 md:py-2">
                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={totalRows}
                  itemsPerPage={recordsPerPage}
                  onPageChange={(page) => {
                    if (page > currentPage && nextToken) {
                      fetchNextPage()
                    } else if (page < currentPage) {
                      fetchPreviousPage()
                    }
                  }}
                />
              </div>
            )}

            {/* Mobile: Card/List layout */}
            <div className="block md:hidden space-y-4 p-2">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <div key={index} className="rounded-xl border border-orange-600/20 bg-[#0f1d24] p-5 flex flex-col gap-4 shadow-lg">
                    <div className="flex items-center justify-between sticky top-0 bg-[#0f1d24] z-10 pb-2">
                      <span className="font-extrabold text-orange-400 text-xl">Log #{index + 1}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-[#849DA6] dark:text-[#506C77] hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-[#142A33] dark:hover:text-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#CAD0D2] dark:bg-[#0D1315] border border-[#506C77]">
                          <DropdownMenuLabel className="text-[#142A33] dark:text-white font-['Helvetica'] font-normal">Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleViewDetails(log)}
                            className="text-[#142A33] dark:text-white hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-[#142A33] dark:hover:text-white focus:bg-[#FFB082] dark:focus:bg-[#C25F28] focus:text-[#142A33] dark:focus:text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#506C77]" />
                          <DropdownMenuItem 
                            className="text-red-500 hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-red-500 focus:bg-[#FFB082] dark:focus:bg-[#C25F28] focus:text-red-500" 
                            onClick={() => handleDeleteLog(log)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Show up to 5 fields as summary in a grid */}
                    <div className="grid grid-cols-1 gap-y-1 gap-x-4 text-sm">
                      {visibleColumns.slice(0, 5).map((column) => (
                        <div key={column} className="flex gap-2 items-center">
                          <span className="text-muted-foreground font-medium">{column}:</span>
                          <span className="font-mono text-xs break-all max-w-full">
                            {column === "albstatuscode" ? (
                              <Badge variant="outline" className={getStatusBadgeColor(String(log[column]))}>
                                {log[column] !== null ? String(log[column]) : "-"}
                              </Badge>
                            ) : log[column] !== null ? (
                              String(log[column])
                            ) : (
                              "-"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Divider */}
                    <div className="border-t border-orange-600/10" />
                    {/* Expanded details */}
                    {expandedLogId === String(index) && (
                      <div className="pt-3 text-xs flex flex-col gap-1">
                        <LogDetailsView
                          log={log}
                          headers={headers}
                          onClose={() => setExpandedLogId(null)}
                          onValueClick={(field, value) => handleValueClick(field, value)}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">{loading || logsLoading ? "Loading logs..." : "No logs found matching your criteria"}</div>
              )}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    {visibleColumns.map((column) => (
                      <TableHead key={column}>{column.charAt(0).toUpperCase() + column.slice(1)}</TableHead>
                    ))}
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <React.Fragment key={index}>
                        <TableRow
                          className={`hover:bg-[#0a1419] transition-colors ${expandedLogId === String(index) ? "bg-[#0a1419]" : ""}`}
                        >
                          <TableCell className="p-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedLogId === String(index) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <span className="font-mono text-xs">{index + 1}</span>
                            </div>
                          </TableCell>
                          {visibleColumns.map((column) => (
                            <TableCell
                              key={column}
                              className="font-mono text-xs py-2"
                              onClick={() => handleValueClick(column, String(log[column]))}
                            >
                              {column === "albstatuscode" ? (
                                <Badge variant="outline" className={getStatusBadgeColor(String(log[column]))}>
                                  {log[column] !== null ? String(log[column]) : "-"}
                                </Badge>
                              ) : log[column] !== null ? (
                                String(log[column])
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-[#849DA6] dark:text-[#506C77] hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-[#142A33] dark:hover:text-white"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#CAD0D2] dark:bg-[#0D1315] border border-[#506C77]">
                                <DropdownMenuLabel className="text-[#142A33] dark:text-white font-['Helvetica'] font-normal">Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => handleViewDetails(log)}
                                  className="text-[#142A33] dark:text-white hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-[#142A33] dark:hover:text-white focus:bg-[#FFB082] dark:focus:bg-[#C25F28] focus:text-[#142A33] dark:focus:text-white"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-[#506C77]" />
                                <DropdownMenuItem 
                                  className="text-red-500 hover:bg-[#FFB082] dark:hover:bg-[#C25F28] hover:text-red-500 focus:bg-[#FFB082] dark:focus:bg-[#C25F28] focus:text-red-500" 
                                  onClick={() => handleDeleteLog(log)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Log
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {expandedLogId === String(index) && (
                          <TableRow>
                            <TableCell colSpan={visibleColumns.length + 2} className="p-0 border-0">
                              <LogDetailsView
                                log={log}
                                headers={headers}
                                onClose={() => setExpandedLogId(null)}
                                onValueClick={(field, value) => handleValueClick(field, value)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + 2} className="h-24 text-center">
                        {loading || logsLoading ? "Loading logs..." : "No logs found matching your criteria"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
