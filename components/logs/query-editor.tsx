"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
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

export type QueryStatus = "idle" | "running" | "error" | "success"

export interface QueryTab {
  id: string
  name: string
  sql: string
  status: QueryStatus
  error: string | null
}

interface QueryEditorProps {
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

export function QueryEditor({ onRunQuery }: QueryEditorProps) {
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: "query-1",
      name: "Query 1",
      sql: 'SELECT * FROM "cloudtrail" LIMIT 10;',
      status: "idle",
      error: null,
    },
  ])
  const [activeTab, setActiveTab] = useState("query-1")
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)
  const { fetchLogs, loading, error } = useLogsState()
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  // Ref to track if we've already updated the tab status for the current error
  const errorProcessedRef = useRef(false)

  // Load tabs from local storage on initial render
  useEffect(() => {
    const savedTabs = safeLocalStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs)
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          setTabs(parsedTabs)
          setActiveTab(parsedTabs[0].id)
        }
      } catch (e) {
        //console.error("Error parsing saved tabs:", e)
      }
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

  // Update tab status when error state changes - with safeguards to prevent infinite loops
  useEffect(() => {
    // Only process if there's an error and we haven't processed it yet
    if (error && !errorProcessedRef.current && !loading) {
      errorProcessedRef.current = true

      setTabs((prevTabs) =>
        prevTabs.map((tab) => (tab.id === activeTab ? { ...tab, status: "error", error: error } : tab)),
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
  }, [tabs])

  // Close a tab
  const closeTab = useCallback(
    (tabId: string, event?: React.MouseEvent) => {
      event?.stopPropagation()

      if (tabs.length === 1) {
        // Don't close the last tab, reset it instead
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

      const newTabs = tabs.filter((tab) => tab.id !== tabId)
      setTabs(newTabs)

      // If we're closing the active tab, set a new active tab
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id)
      }
    },
    [tabs, activeTab],
  )

  // Start editing a tab name
  const startEditingTab = useCallback(
    (tabId: string, event?: React.MouseEvent) => {
      event?.stopPropagation()
      const tab = tabs.find((t) => t.id === tabId)
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
        tabs.map((tab) =>
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
    (e: React.KeyboardEvent) => {
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

  // Update SQL in a tab
  const updateSql = useCallback(
    (tabId: string, sql: string) => {
      setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, sql } : tab)))
    },
    [tabs],
  )

  // Format SQL in the active tab
  const formatSqlInActiveTab = useCallback(() => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab)
    if (activeTabData) {
      const formattedSql = formatSql(activeTabData.sql)
      updateSql(activeTab, formattedSql)
    }
  }, [activeTab, tabs, updateSql])

  // Run a query
  const runQuery = useCallback(async () => {
    const tab = tabs.find((t) => t.id === activeTab)
    if (!tab) return

    // Reset error processed flag
    errorProcessedRef.current = false

    // Update tab status to running
    setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, status: "running", error: null } : t)))

    try {
      await fetchLogs(tab.sql)

      // Only update to success if there's no error
      if (!useLogsState.getState().error) {
        setTabs(tabs.map((t) => (t.id === activeTab ? { ...t, status: "success", error: null } : t)))
      }

      // Call the onRunQuery callback if provided
      if (onRunQuery) {
        onRunQuery(tab.sql)
      }
    } catch (error) {
      //console.error("Error running query:", error)
      // Update tab with error
      setTabs(
        tabs.map((t) =>
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
    setTabs(
      tabs.map((tab) =>
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

  // Handle query from builder
  const handleQueryFromBuilder = (query: string) => {
    updateSql(activeTab, query)
    setIsQueryBuilderOpen(false)
  }

  // Get the active tab data
  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0]

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
    const storedQuery = getStoredQuery()
    if (storedQuery) {
      updateSql(activeTab, storedQuery)
      // Clear the stored query to prevent it from being loaded again
      clearStoredQuery()

      // Optional: Auto-run the query
      // Uncomment the next line if you want the query to run automatically
      // runQuery();
    }
  }, [activeTab, updateSql, runQuery])

  return (
    <div
      className={`flex flex-col h-full border rounded-md ${isDarkTheme ? "bg-[#0a1419] border-orange-600/20" : "bg-white border-gray-200"}`}
    >
      <div
        className={`flex items-center justify-between border-b ${isDarkTheme ? "border-orange-600/20 bg-[#0f1d24]" : "border-gray-200 bg-gray-50"}`}
      >
        <div className="flex-1 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`h-10 p-0 w-full flex items-center ${isDarkTheme ? "bg-transparent" : "bg-gray-50"}`}>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`relative h-10 px-4 rounded-none border-r ${
                    isDarkTheme
                      ? `border-orange-600/20 data-[state=active]:bg-[#0a1419] data-[state=active]:text-orange-500 text-gray-300`
                      : `border-gray-200 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm text-gray-700`
                  } group`}
                  onDoubleClick={(e) => startEditingTab(tab.id, e)}
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
                        onChange={(e) => setEditingTabName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={saveTabName}
                        className={`w-24 border rounded px-1 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                          isDarkTheme
                            ? "bg-[#0f1d24] text-white border-orange-600/20"
                            : "bg-white text-gray-800 border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span>{tab.name}</span>
                        <button
                          onClick={(e) => startEditingTab(tab.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil className={`h-3 w-3 ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={(e) => closeTab(tab.id, e)}
                      className={`ml-2 rounded-full p-0.5 ${isDarkTheme ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
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
          className={`p-2 border-b flex justify-between items-center ${
            isDarkTheme ? "bg-[#0f1d24] border-orange-600/20" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center">
            <span className={`text-sm font-medium mr-2 ${isDarkTheme ? "text-gray-200" : "text-gray-700"}`}>
              SQL Query
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={formatSqlInActiveTab} title="Format SQL">
              <AlignLeft className={`h-4 w-4 ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={isDarkTheme ? "border-orange-600/20 text-orange-500" : "border-orange-200 text-orange-600"}
              onClick={() => setIsQueryBuilderOpen(true)}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Query Builder
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={runQuery}
              disabled={loading || activeTabData.status === "running"}
            >
              {loading || activeTabData.status === "running" ? (
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
            <Button variant="outline" size="sm" onClick={clearActiveTab}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        <SqlEditor
          value={activeTabData.sql}
          onChange={(value) => updateSql(activeTab, value)}
          status={activeTabData.status}
          error={activeTabData.error || error}
        />
      </div>

      <SQLQueryBuilder
        isOpen={isQueryBuilderOpen}
        onClose={() => setIsQueryBuilderOpen(false)}
        onApply={handleQueryFromBuilder}
      />
    </div>
  )
}
