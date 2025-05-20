"use client"

import type React from "react"
import * as JSX from "react/jsx-runtime"

import { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Plus, X, MoreVertical, Play, AlertCircle, CheckCircle, Wand2, AlignLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SqlEditor } from "@/components/logs/sql-editor"
import { SQLQueryBuilder } from "@/components/logs/sql-query-builder"
import { useLogsState } from "@/lib/state/logs/logsState"
import { formatSql } from "@/lib/services/sql-formatter"
import { useTheme } from "next-themes"
// Import the query storage utilities at the top of the file
import { getStoredQuery, clearStoredQuery } from "@/lib/utils/query-storage"
import { validateSqlQuery, validateSqlSyntax, parseSqlToBuilderState } from "@/lib/utils/sql-validator"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

export type QueryStatus = "idle" | "running" | "error" | "success"

export interface QueryTab {
  id: string
  name: string
  sql: string
  status: QueryStatus
  error: string | null
}

export interface QueryEditorProps {
  onRunQuery?: (query: string) => void
}

const LOCAL_STORAGE_KEY = "affinity-query-tabs"

// Safe localStorage functions
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      //console.error(`Error writing to localStorage: ${error}`)
    }
  },
}

export interface QueryEditorHandle {
  setSqlForActiveTab: (sql: string) => void;
}

export const QueryEditor = forwardRef<QueryEditorHandle, QueryEditorProps>(function QueryEditor({ onRunQuery }: QueryEditorProps, ref: React.Ref<QueryEditorHandle>) {
  const hasLoadedTabs = useRef(false)
  const [tabs, setTabs] = useState<QueryTab[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState<string>("")
  const editInputRef = useRef<HTMLInputElement>(null)
  const { fetchLogs, loading, error, logs } = useLogsState()
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  // Ref to track if we've already updated the tab status for the current error
  const errorProcessedRef = useRef(false)
  const [dismissedError, setDismissedError] = useState<boolean>(false)
  const [builderSyncState, setBuilderSyncState] = useState<any | null>(null)

  // Load tabs from local storage on initial render (only once)
  useEffect(() => {
    if (!hasLoadedTabs.current) {
      const savedTabs = safeLocalStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedTabs) {
        try {
          const parsedTabs = JSON.parse(savedTabs)
          if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
            setTabs(parsedTabs)
            setActiveTab(parsedTabs[0].id)
            hasLoadedTabs.current = true
            return
          }
        } catch (e) {
          //console.error("Error parsing saved tabs:", e)
        }
      }
      // If nothing in storage, set default
      setTabs([
        {
          id: "query-1",
          name: "Query 1",
          sql: 'SELECT * FROM "cloudtrail" LIMIT 10;',
          status: "idle",
          error: null,
        },
      ])
      setActiveTab("query-1")
      hasLoadedTabs.current = true
    }
  }, [])

  // Save tabs to local storage whenever they change
  useEffect(() => {
    safeLocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs))
  }, [tabs])

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTabId])

  // Reset dismissed error when activeTab changes or when error changes
  useEffect(() => {
    setDismissedError(false)
  }, [activeTab, error])

  // Update tab status when error state changes - with safeguards to prevent infinite loops
  useEffect(() => {
    // Only process if there's an error and we haven't processed it yet
    if (error && !errorProcessedRef.current && !loading) {
      errorProcessedRef.current = true
      setDismissedError(false)

      setTabs((prevTabs: QueryTab[]) =>
        prevTabs.map((tab: QueryTab) => (tab.id === activeTab ? { ...tab, status: "error", error: error } : tab)),
      )
    } else if (!error && !loading) {
      // Reset the flag when there's no error
      errorProcessedRef.current = false
    }
  }, [error, activeTab, loading])

  // Create a new tab
  const createNewTab = useCallback(() => {
    const newTabId = `query-${Date.now()}`
    const newTab: QueryTab = {
      id: newTabId,
      name: `Query ${tabs.length + 1}`,
      sql: 'SELECT * FROM "cloudtrail" LIMIT 10;',
      status: "idle",
      error: null,
    }
    setTabs([...tabs, newTab])
    setActiveTab(newTabId)
    useLogsState.getState().clearLogs(); // Clear logs/results for new tab
  }, [tabs])

  // Close a tab
  const closeTab = useCallback(
    (tabId: string, event?: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event?.stopPropagation()
      if (tabs.length === 1) {
        setTabs([
          {
            id: "query-1",
            name: "Query 1",
            sql: 'SELECT * FROM "cloudtrail" LIMIT 10;',
            status: "idle",
            error: null,
          },
        ])
        setActiveTab("query-1")
        return
      }
      const newTabs = tabs.filter((tab: QueryTab) => tab.id !== tabId)
      setTabs(newTabs)
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id)
      }
    },
    [tabs, activeTab],
  )

  // Start editing a tab name
  const startEditingTab = useCallback(
    (tabId: string, event?: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event?.stopPropagation()
      const tab = tabs.find((t: QueryTab) => t.id === tabId)
      if (tab) {
        setEditingTabId(tabId)
        setEditingTabName(tab.name)
      }
    },
    [tabs],
  )

  // Save the edited tab name
  const saveTabName = useCallback(() => {
    if (editingTabId) {
      setTabs(
        tabs.map((tab: QueryTab) =>
          tab.id === editingTabId
            ? {
                ...tab,
                name: editingTabName.trim() || `Query ${tabs.indexOf(tab) + 1}`,
              }
            : tab,
        ),
      )
      setEditingTabId(null)
    }
  }, [editingTabId, editingTabName, tabs])

  // Handle key press in the edit input
  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        saveTabName()
      } else if (e.key === "Escape") {
        setEditingTabId(null)
      }
    },
    [saveTabName],
  )

  // Handle click outside the edit input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingTabId && editInputRef.current && !editInputRef.current.contains(event.target as Node)) {
        saveTabName()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingTabId, saveTabName])

  // Add real-time syntax validation and builder sync when updating SQL
  const updateSql = useCallback(
    (tabId: string, sql: string) => {
      // Apply basic syntax validation in real-time
      const syntaxResult = validateSqlSyntax(sql);
      // Parse SQL to builder state if valid
      let parsedBuilderState = null;
      if (syntaxResult.isValid) {
        try {
          parsedBuilderState = parseSqlToBuilderState(sql);
        } catch (e) {
          parsedBuilderState = null;
        }
      }
      setTabs(tabs.map((tab: QueryTab) =>
        tab.id === tabId
          ? {
              ...tab,
              sql,
              status: !syntaxResult.isValid ? "error" : "idle",
              error: !syntaxResult.isValid ? syntaxResult.error || null : null
            }
          : tab
      ));
      if (parsedBuilderState) setBuilderSyncState(parsedBuilderState);
    },
    [tabs],
  );

  // When the active tab SQL changes, update builderSyncState
  useEffect(() => {
    const tab = tabs.find((t: QueryTab) => t.id === activeTab);
    if (tab && tab.sql) {
      try {
        const parsed = parseSqlToBuilderState(tab.sql);
        setBuilderSyncState(parsed);
      } catch {}
    }
  }, [activeTab, tabs]);

  // Format SQL in the active tab
  const formatSqlInActiveTab = useCallback(() => {
    const activeTabData = tabs.find((tab: QueryTab) => tab.id === activeTab)
    if (activeTabData) {
      const formattedSql = formatSql(activeTabData.sql)
      updateSql(activeTab, formattedSql)
    }
  }, [activeTab, tabs, updateSql])

  // Run a query
  const runQuery = useCallback(async () => {
    const tab = tabs.find((t: QueryTab) => t.id === activeTab)
    if (!tab) return

    // Reset error processed flag
    errorProcessedRef.current = false

    // Validate SQL query before execution
    const validationResult = validateSqlQuery(tab.sql);
    if (!validationResult.isValid) {
      setTabs(
        tabs.map((t: QueryTab) =>
          t.id === activeTab
            ? {
                ...t,
                status: "error",
                error: validationResult.error || "Invalid SQL query",
              }
            : t
        )
      );
      return;
    }

    // Update tab status to running
    setTabs(tabs.map((t: QueryTab) => (t.id === activeTab ? { ...t, status: "running", error: null } : t)))

    try {
      await fetchLogs(tab.sql)

      // Only update to success if there's no error
      if (!useLogsState.getState().error) {
        setTabs(tabs.map((t: QueryTab) => (t.id === activeTab ? { ...t, status: "success", error: null } : t)))
      }

      // Call the onRunQuery callback if provided
      if (onRunQuery) {
        onRunQuery(tab.sql)
      }
    } catch (error) {
      //console.error("Error running query:", error)
      // Update tab with error
      setTabs(
        tabs.map((t: QueryTab) =>
          t.id === activeTab
            ? {
                ...t,
                status: "error",
                error: error instanceof Error ? error.message : String(error),
              }
            : t,
        ),
      )
    }
  }, [activeTab, tabs, fetchLogs, onRunQuery])

  // Clear the active tab
  const clearActiveTab = useCallback(() => {
    setDismissedError(false)
    setTabs(
      tabs.map((tab: QueryTab) =>
        tab.id === activeTab
          ? {
              ...tab,
              sql: "",
              status: "idle",
              error: null,
            }
          : tab,
      ),
    )
  }, [activeTab, tabs])

  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setTabs([
      {
        id: "query-1",
        name: "Query 1",
        sql: 'SELECT * FROM "cloudtrail" LIMIT 10;',
        status: "idle",
        error: null,
      },
    ])
    setActiveTab("query-1")
  }, [])

  // When an example query is selected in the builder, update both SQL and builder state
  const handleQueryFromBuilder = (query: string) => {
    updateSql(activeTab, query)
    setIsQueryBuilderOpen(false)
  }

  // Get the active tab data
  const activeTabData = tabs.find((tab: QueryTab) => tab.id === activeTab) || tabs[0] || {}

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to run query
      if (e.ctrlKey && e.key === "Enter") {
        runQuery()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [runQuery])

  // Add a useEffect to check for stored queries when the component mounts
  // Add this after the existing useEffect hooks
  useEffect(() => {
    // Only run if tabs and activeTab are ready
    if (!activeTab || tabs.length === 0) return;
    const storedQuery = getStoredQuery();
    if (storedQuery) {
      updateSql(activeTab, storedQuery);
      clearStoredQuery();
      // Optionally: runQuery();
    }
    // Only run once after tabs/activeTab are set
    // eslint-disable-next-line
  }, [tabs, activeTab]);

  useImperativeHandle(ref, () => ({
    setSqlForActiveTab: (sql: string) => {
      updateSql(activeTab, sql)
      setActiveTab(activeTab) // ensure tab is focused
    },
  }), [activeTab, updateSql])

  return (
    <div
      className={`flex flex-col h-full border rounded-md ${isDarkTheme ? "bg-[#0a1419] border-orange-600/20" : "bg-white border-gray-200"}`}
    >
      <div
        className={`flex items-center justify-between border-b ${isDarkTheme ? "border-orange-600/20 bg-[#0f1d24]" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="flex-1 min-w-0 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`h-10 p-0 w-full flex items-center overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-orange-600/30 scrollbar-track-transparent min-w-0 max-h-12 ${isDarkTheme ? "bg-transparent" : "bg-gray-50"}`} style={{ WebkitOverflowScrolling: 'touch' }}>
              {tabs.map((tab: QueryTab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`relative h-10 px-4 rounded-none border-r min-w-[120px] max-w-[180px] truncate text-sm md:text-base whitespace-nowrap ${
                    isDarkTheme
                      ? `border-orange-600/20 data-[state=active]:bg-[#0a1419] data-[state=active]:text-orange-500 text-gray-300`
                      : `border-gray-200 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm text-gray-700`
                  } group`}
                  onDoubleClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => startEditingTab(tab.id, e)}
                >
                  <div className="flex items-center gap-2">
                    {tab.status === "running" && <Play className="h-3 w-3 text-blue-500 animate-pulse" />}
                    {tab.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                    {tab.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                    {editingTabId === tab.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTabName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTabName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={saveTabName}
                        className={`w-24 border rounded px-1 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                          isDarkTheme
                            ? "bg-[#0f1d24] text-white border-orange-600/20"
                            : "bg-white text-gray-800 border-gray-300"
                        }`}
                        onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => e.stopPropagation()}
                      />
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[120px] cursor-pointer">{tab.name}</span>
                          </TooltipTrigger>
                          <TooltipContent>{tab.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <span
                      onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => { e.stopPropagation(); startEditingTab(tab.id, e); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      role="button"
                      tabIndex={0}
                    >
                      <Pencil className={`h-3 w-3 ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`} />
                    </span>
                    <span
                      onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => { e.stopPropagation(); closeTab(tab.id, e); }}
                      className={`ml-2 rounded-full p-0.5 ${isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"} cursor-pointer`}
                      role="button"
                      tabIndex={0}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={createNewTab}>
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={closeAllTabs}>Close all tabs</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div
          className={`p-2 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 ${
            isDarkTheme ? "bg-[#0f1d24] border-orange-600/20" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center mb-2 md:mb-0">
            <span className={`text-sm font-medium mr-2 ${isDarkTheme ? "text-gray-200" : "text-gray-700"}`}>
              SQL Query
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatSqlInActiveTab} title="Format SQL">
              <AlignLeft className={`h-4 w-4 ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`} />
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className={`w-full md:w-auto ${isDarkTheme ? "border-orange-600/20 text-orange-500" : "border-orange-200 text-orange-600"}`}
              onClick={() => setIsQueryBuilderOpen(true)}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Query Builder
            </Button>
            <Button
              variant="default"
              size="sm"
              className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white"
              onClick={runQuery}
              disabled={loading || activeTabData?.status === "running"}
            >
              {(loading || activeTabData?.status === "running") ? (
                <>
                  <Play className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Query
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={clearActiveTab}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full p-2 md:p-4">
          <SqlEditor
            value={activeTabData.sql}
            onChange={(value) => updateSql(activeTab, value)}
            status={activeTabData.status}
            error={null}
          />
        </div>
        
        {/* Error Panel - Prominently display query errors */}
        {(activeTabData.error || error) && !dismissedError && (
          <div className={`p-4 border-t ${isDarkTheme ? "bg-red-950/20 border-red-600/30" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-start max-w-full">
              <AlertCircle className={`h-5 w-5 mr-3 flex-shrink-0 ${isDarkTheme ? "text-red-500" : "text-red-600"}`} />
              <div className="flex-1 overflow-auto">
                <h4 className={`font-medium mb-1 ${isDarkTheme ? "text-red-400" : "text-red-700"}`}>SQL Query Error</h4>
                <p className={`text-sm ${isDarkTheme ? "text-red-300" : "text-red-600"} whitespace-pre-wrap break-words`}>
                  {/* Filter technical backend errors */}
                  {(() => {
                    const msg = activeTabData.error || error;
                    if (
                      msg?.toLowerCase().includes("cannot read properties of undefined") ||
                      msg?.toLowerCase().includes("reading 'message'")
                    ) {
                      return "An unexpected error occurred. Please check your query and try again.";
                    }
                    return msg;
                  })()}
                </p>
                {/* Show actionable advice */}
                <div className="mt-2 text-xs text-gray-400">
                  Tip: Check your SQL syntax, ensure table names and columns are correct, and that all quotes and parentheses are balanced.
                </div>
              </div>
              <button 
                onClick={() => setDismissedError(true)}
                className={`flex-shrink-0 p-1 rounded-full ${isDarkTheme ? "hover:bg-red-800/30" : "hover:bg-red-200"}`}
                aria-label="Dismiss error"
              >
                <X className={`h-4 w-4 ${isDarkTheme ? "text-red-400" : "text-red-600"}`} />
              </button>
            </div>
          </div>
        )}
        {/* No Results Panel - Shows when query executed but no results found */}
        {activeTabData.status === "success" && !loading && !error && !activeTabData.error && logs.length === 0 && (
          <div className="p-4 border-t border-orange-600/20 bg-[#0a1419]/50 text-center">
            <p className="text-gray-400">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      <SQLQueryBuilder
        isOpen={isQueryBuilderOpen}
        onClose={() => setIsQueryBuilderOpen(false)}
        onApply={handleQueryFromBuilder}
        builderSyncState={builderSyncState}
      />
    </div>
  )
})
