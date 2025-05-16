"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Clock,
  Database,
  Download,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  ServerCrash,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QueryStatus } from "@/components/logs/query-editor"
import { useLogsState } from "@/lib/state/logs/logsState"
import { Badge } from "@/components/ui/badge"

interface QueryResultsProps {
  queryStatus: QueryStatus
  queryError: string | null
  queryMetrics: {
    queueTime?: number
    runTime?: number
    dataScanned?: string
  }
  onRetry?: () => void
  onValueClick?: (field: string, value: string) => void
}

export function QueryResults({ queryStatus, queryError, queryMetrics, onRetry, onValueClick }: QueryResultsProps) {
  const [activeTab, setActiveTab] = useState("results")
  const { logs, headers, totalRows, loading, error, errorDetails, lastQuery } = useLogsState()
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const errorProcessedRef = useRef(false)

  // Reset error processed ref when error changes
  useEffect(() => {
    if (!error && !queryError) {
      errorProcessedRef.current = false
    }
  }, [error, queryError])

  // Show only the first 5 columns or all if less than 5
  const visibleHeaders = headers.length > 0 ? headers.slice(0, 5) : []

  // If there are no results and no error, show a placeholder
  if (queryStatus === "idle") {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
        Run a query to see results
      </div>
    )
  }

  // If the query is running, show a loading indicator
  if (queryStatus === "running" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <div className="text-muted-foreground">Running query...</div>
        </div>
      </div>
    )
  }

  // If there's an error, show it with more details
  if ((queryStatus === "error" && queryError) || error) {
    // Use the error details from the state if available
    let errorMessage = errorDetails?.message || error || queryError || "Unknown error"
    const queryExecutionStatus = errorDetails?.status || "FAILED"

    // Filter technical backend errors
    if (
      errorMessage?.toLowerCase().includes("cannot read properties of undefined") ||
      errorMessage?.toLowerCase().includes("reading 'message'")
    ) {
      errorMessage = "An unexpected error occurred. Please check your query and try again."
    }

    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-[#0f1d24] border-b border-orange-600/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="font-medium text-red-500">Query Failed</h3>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Query
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="bg-[#0a1419] border border-red-500/20 rounded-lg p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <ServerCrash className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Query Error</h3>
                <div className="text-red-400 font-medium text-lg mb-3">{errorMessage}</div>
                <div className="text-yellow-500 text-sm mb-3">Status: {queryExecutionStatus}</div>
                <p className="text-muted-foreground">The server couldn't process your query. This could be due to:</p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
                  <li>Invalid table or column references</li>
                  <li>Syntax errors in your query</li>
                  <li>Temporary service unavailability</li>
                </ul>
              </div>
            </div>
          </div>

          {lastQuery && (
            <div className="bg-[#0a1419] border border-orange-600/20 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-orange-500 mb-2">Query</h4>
              <pre className="bg-[#0f1d24] p-3 rounded-md text-xs text-white overflow-auto">{lastQuery}</pre>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-400">
              Check your query syntax and try again. If the problem persists, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    )
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

  // If there are results, show them
  if (queryStatus === "success" && logs && logs.length > 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f1d24] border-b border-orange-600/20">
            <TabsList className="bg-[#0a1419]">
              <TabsTrigger value="results">Query results</TabsTrigger>
              <TabsTrigger value="metrics">Query metrics</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <TabsContent value="results" className="p-0 m-0 flex-1 overflow-auto">
            {/* Mobile: Card/List layout */}
            <div className="block md:hidden space-y-4 p-2">
              {logs.map((row, rowIndex) => (
                <div key={rowIndex} className="rounded-xl border border-orange-600/20 bg-[#0f1d24] p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-orange-400 text-lg">Log #{rowIndex + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setExpandedRow(expandedRow === rowIndex ? null : rowIndex)}
                    >
                      {expandedRow === rowIndex ? (
                        <ChevronDown className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {/* Show up to 5 fields as summary */}
                  <div className="flex flex-col gap-1 text-sm">
                    {visibleHeaders.slice(0, 5).map((column) => (
                      <div key={column} className="flex gap-2 items-center">
                        <span className="text-muted-foreground font-medium">{column}:</span>
                        <span className="font-mono text-xs break-all max-w-full">
                          {column.toLowerCase().includes("statuscode") ? (
                            <Badge variant="outline" className={getStatusBadgeColor(String(row[column]))}>
                              {row[column] !== null ? String(row[column]) : "-"}
                            </Badge>
                          ) : row[column] !== null ? (
                            String(row[column])
                          ) : (
                            "-"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Expanded details */}
                  {expandedRow === rowIndex && (
                    <div className="mt-3 pt-3 border-t border-orange-600/10 text-xs flex flex-col gap-1">
                      {visibleHeaders.map((column) => (
                        <div key={column} className="flex gap-2 items-center">
                          <span className="text-muted-foreground font-medium">{column}:</span>
                          <span className="font-mono break-all max-w-full">
                            {column.toLowerCase().includes("statuscode") ? (
                              <Badge variant="outline" className={getStatusBadgeColor(String(row[column]))}>
                                {row[column] !== null ? String(row[column]) : "-"}
                              </Badge>
                            ) : row[column] !== null ? (
                              String(row[column])
                            ) : (
                              "-"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <div className="overflow-auto max-h-[calc(50vh-200px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      {visibleHeaders.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className={expandedRow === rowIndex ? "bg-[#0a1419]" : ""}>
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setExpandedRow(expandedRow === rowIndex ? null : rowIndex)}
                          >
                            {expandedRow === rowIndex ? (
                              <ChevronDown className="h-4 w-4 text-orange-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        {visibleHeaders.map((column) => (
                          <TableCell key={column} className="font-mono text-xs">
                            {column in row ? (
                              <span
                                className="cursor-pointer"
                                onClick={() => onValueClick?.(column, String(row[column]))}
                                tabIndex={0}
                                role="button"
                                style={{ display: "inline-block" }}
                              >
                                {column.toLowerCase().includes("statuscode") ? (
                                  <Badge variant="outline" className={getStatusBadgeColor(String(row[column]))}>
                                    {row[column] !== null ? String(row[column]) : "-"}
                                  </Badge>
                                ) : row[column] !== null ? (
                                  String(row[column])
                                ) : (
                                  "-"
                                )}
                              </span>
                            ) : (
                              "undefined"
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-2 border-t border-orange-600/20 text-xs text-muted-foreground">
                {totalRows} rows returned
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="p-0 m-0">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0a1419] p-4 rounded-md border border-orange-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Time in queue</span>
                  </div>
                  <div className="text-xl">{queryMetrics.queueTime || 0} ms</div>
                </div>
                <div className="bg-[#0a1419] p-4 rounded-md border border-orange-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Run time</span>
                  </div>
                  <div className="text-xl">{queryMetrics.runTime || 0} ms</div>
                </div>
                <div className="bg-[#0a1419] p-4 rounded-md border border-orange-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Data scanned</span>
                  </div>
                  <div className="text-xl">{queryMetrics.dataScanned || "-"}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // If query was successful but no results, do not render the table
  if (queryStatus === "success" && (!logs || logs.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-green-500">
        <div className="flex flex-col items-center gap-2">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="text-xl font-medium">Query Completed</div>
        </div>
      </div>
    )
  }

  // Fallback
  return <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">No results to display</div>
}
