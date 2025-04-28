import { create } from "zustand"
import logService, { type LogRecord } from "@/lib/services/logService"

interface LogsState {
  logs: LogRecord[]
  headers: string[]
  totalRows: number
  recordsPerPage: number
  loading: boolean
  error: string | null
  errorDetails: {
    message: string
    status: string
  } | null
  executionId: string | null
  nextToken: string | null
  currentPage: number
  pageTokens: { [key: number]: string | null }
  tables: { [key: string]: string[] }
  loadingTables: boolean
  lastQuery: string | null
  fetchLogs: (query: string) => Promise<void>
  fetchNextPage: () => Promise<void>
  fetchPreviousPage: () => Promise<void>
  fetchDatabases: () => Promise<void>
  setLogs: (logs: LogRecord[]) => void
  setHeaders: (headers: string[]) => void
  setTotalRows: (totalRows: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null, details?: { message: string; status: string } | null) => void
  setCurrentPage: (page: number) => void
}

export const useLogsState = create<LogsState>((set, get) => ({
  logs: [],
  headers: [],
  totalRows: 0,
  recordsPerPage: 10,
  loading: false,
  error: null,
  errorDetails: null,
  executionId: null,
  nextToken: null,
  currentPage: 1,
  pageTokens: { 1: null }, // Initialize with page 1 having no previous token
  tables: {},
  loadingTables: false,
  lastQuery: null,

  fetchLogs: async (query: string) => {
    set({ loading: true, error: null, errorDetails: null, lastQuery: query })
    try {
      const response = await logService.searchLogs(query)

      // Check if the response has a non-200 status code
      if (response.statusCode !== 200) {
        const errorMessage = response.body.message || "Unknown error"
        const queryStatus = response.body["Query Execution Status"] || "FAILED"

        set({
          error: errorMessage,
          errorDetails: {
            message: errorMessage,
            status: queryStatus,
          },
          loading: false,
          logs: [],
          headers: [],
          totalRows: 0,
          executionId: null,
          nextToken: null,
        })
        return
      }

      if (response && response.body && response.body.affinity_logs) {
        const { affinity_logs } = response.body
        const extractedLogs = affinity_logs.records || []
        const extractedHeaders = affinity_logs.headers || []

        // Store the execution ID for subsequent requests
        const executionId = affinity_logs.execution_id

        // Store the next token for pagination
        const nextToken = affinity_logs.next_token

        // Initialize pageTokens with the first page token
        const pageTokens = { 1: null, 2: nextToken }

        set({
          logs: extractedLogs,
          headers: extractedHeaders,
          totalRows: affinity_logs.total_rows || 0,
          recordsPerPage: affinity_logs.records_per_page || 10,
          loading: false,
          executionId,
          nextToken,
          currentPage: 1,
          pageTokens,
        })
      } else {
        set({
          error: "Invalid response format",
          errorDetails: {
            message: "Invalid response format",
            status: "FAILED",
          },
          loading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: {
          message: error instanceof Error ? error.message : "Unknown error",
          status: "FAILED",
        },
        loading: false,
      })
    }
  },

  fetchNextPage: async () => {
    const { executionId, nextToken, currentPage, pageTokens, headers } = get()

    if (!executionId || !nextToken) {
      return
    }

    set({ loading: true, error: null, errorDetails: null })

    try {
      const response = await logService.searchLogsNextPage(executionId, nextToken, headers)

      // Check if the response has a non-200 status code
      if (response.statusCode !== 200) {
        const errorMessage = response.body.message || "Unknown error"
        const queryStatus = response.body["Query Execution Status"] || "FAILED"

        set({
          error: errorMessage,
          errorDetails: {
            message: errorMessage,
            status: queryStatus,
          },
          loading: false,
        })
        return
      }

      if (response && response.body && response.body.affinity_logs) {
        const { affinity_logs } = response.body
        const newLogs = affinity_logs.records || []
        const newNextToken = affinity_logs.next_token

        // Update pageTokens with the new token for the next page
        const newPageTokens = { ...pageTokens }
        newPageTokens[currentPage + 2] = newNextToken

        set({
          logs: newLogs,
          nextToken: newNextToken,
          currentPage: currentPage + 1,
          pageTokens: newPageTokens,
          loading: false,
        })
      } else {
        set({
          error: "Invalid response format for next page",
          errorDetails: {
            message: "Invalid response format for next page",
            status: "FAILED",
          },
          loading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: {
          message: error instanceof Error ? error.message : "Unknown error",
          status: "FAILED",
        },
        loading: false,
      })
    }
  },

  fetchPreviousPage: async () => {
    const { executionId, currentPage, pageTokens, headers } = get()

    if (currentPage <= 1 || !executionId) {
      return
    }

    set({ loading: true, error: null, errorDetails: null })

    try {
      // Get the token for the previous page
      const previousToken = pageTokens[currentPage - 1]

      const response = await logService.searchLogsNextPage(executionId, previousToken || null, headers)

      // Check if the response has a non-200 status code
      if (response.statusCode !== 200) {
        const errorMessage = response.body.message || "Unknown error"
        const queryStatus = response.body["Query Execution Status"] || "FAILED"

        set({
          error: errorMessage,
          errorDetails: {
            message: errorMessage,
            status: queryStatus,
          },
          loading: false,
        })
        return
      }

      if (response && response.body && response.body.affinity_logs) {
        const { affinity_logs } = response.body
        const newLogs = affinity_logs.records || []

        set({
          logs: newLogs,
          nextToken: pageTokens[currentPage],
          currentPage: currentPage - 1,
          loading: false,
        })
      } else {
        set({
          error: "Invalid response format for previous page",
          errorDetails: {
            message: "Invalid response format for previous page",
            status: "FAILED",
          },
          loading: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: {
          message: error instanceof Error ? error.message : "Unknown error",
          status: "FAILED",
        },
        loading: false,
      })
    }
  },

  fetchDatabases: async () => {
    set({ loadingTables: true, error: null, errorDetails: null })
    try {
      const response = await logService.getDatabases()

      if (response && response.statusCode === 200 && response.body && response.body.tables) {
        set({
          tables: response.body.tables,
          loadingTables: false,
        })
      } else {
        set({
          error: "Invalid response format for databases",
          errorDetails: {
            message: "Invalid response format for databases",
            status: "FAILED",
          },
          loadingTables: false,
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: {
          message: error instanceof Error ? error.message : "Unknown error",
          status: "FAILED",
        },
        loadingTables: false,
      })
    }
  },

  setLogs: (logs: LogRecord[]) => set({ logs }),
  setHeaders: (headers: string[]) => set({ headers }),
  setTotalRows: (totalRows: number) => set({ totalRows }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null, details = null) => set({ error, errorDetails: details }),
  setCurrentPage: (page: number) => set({ currentPage: page }),
}))

export default useLogsState
