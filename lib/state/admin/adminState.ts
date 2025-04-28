import { proxy, subscribe } from "valtio"

// Define the structure for page visibility
interface PageVisibility {
  [key: string]: boolean
}

// Define the admin state interface
interface AdminState {
  pageVisibility: PageVisibility
  togglePageVisibility: (page: string) => void
  setPageVisibility: (page: string, visible: boolean) => void
  isPageVisible: (page: string) => boolean
}

// Initialize with all pages visible by default
const defaultPageVisibility: PageVisibility = {
  // Analytics section
  "/analytics": true,
  "/analytics/aws": true,
  "/analytics/github": true,
  "/analytics/azure": true,
  "/analytics/gcp": true,
  "/analytics/agents": true,

  // Cloud Status section
  "/cloud/aws": true,
  "/cloud/github": true,
  "/cloud/azure": true,
  "/cloud/gcp": true,

  // Management section
  "/management/users": true,
  "/management/integrations": true,
  "/management/notifications": true,
  "/management/agents": true,

  // Individual pages
  "/logs": true,
  "/alerts": true,
  "/wiki": true,
  "/legal": true,
}

// Load saved visibility settings from localStorage safely
const loadSavedVisibility = (): PageVisibility => {
  if (typeof window === "undefined") return defaultPageVisibility

  try {
    const saved = localStorage.getItem("adminPageVisibility")
    return saved ? JSON.parse(saved) : defaultPageVisibility
  } catch (error) {
    console.error("Error loading page visibility settings:", error)
    return defaultPageVisibility
  }
}

// Create the admin state with only data properties
const adminState = proxy<AdminState>({
  pageVisibility: typeof window === "undefined" ? defaultPageVisibility : loadSavedVisibility(),
} as AdminState)

// Define the methods separately to avoid self-reference issues
adminState.togglePageVisibility = (page: string) => {
  const currentVisibility = adminState.pageVisibility[page] ?? true
  adminState.pageVisibility[page] = !currentVisibility
}

adminState.setPageVisibility = (page: string, visible: boolean) => {
  adminState.pageVisibility[page] = visible
}

adminState.isPageVisible = (page: string): boolean => {
  return adminState.pageVisibility[page] ?? true
}

// Subscribe to changes and save to localStorage safely
if (typeof window !== "undefined") {
  subscribe(adminState.pageVisibility, () => {
    try {
      localStorage.setItem("adminPageVisibility", JSON.stringify(adminState.pageVisibility))
    } catch (error) {
      console.error("Error saving page visibility settings:", error)
    }
  })
}

export default adminState
