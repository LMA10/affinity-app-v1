// Utility for storing and retrieving queries between pages
export const storeQuery = (query: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("affinity_stored_query", query)
  }
}

export const getStoredQuery = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("affinity_stored_query")
  }
  return null
}

export const clearStoredQuery = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("affinity_stored_query")
  }
}
