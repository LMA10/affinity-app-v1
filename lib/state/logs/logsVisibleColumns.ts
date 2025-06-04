import { proxy, subscribe } from 'valtio'

// Key for localStorage
const STORAGE_KEY = 'affinity_logs_visible_columns'

// Load from localStorage
function loadVisibleColumnsMap(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

// Save to localStorage
function saveVisibleColumnsMap(map: Record<string, string[]>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

// Valtio proxy for visible columns per table
export const logsVisibleColumnsState = proxy<{ visibleColumnsByTable: Record<string, string[]> }>({
  visibleColumnsByTable: loadVisibleColumnsMap(),
})

// Subscribe to changes and persist
subscribe(logsVisibleColumnsState, () => {
  saveVisibleColumnsMap(logsVisibleColumnsState.visibleColumnsByTable)
})

// Helper to get visible columns for a table
export function getVisibleColumns(table: string, fallback: string[]): string[] {
  return logsVisibleColumnsState.visibleColumnsByTable[table] || fallback
}

// Helper to set visible columns for a table
export function setVisibleColumns(table: string, columns: string[]) {
  logsVisibleColumnsState.visibleColumnsByTable[table] = columns
} 