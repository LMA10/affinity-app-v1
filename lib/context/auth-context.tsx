"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import sessionState from "@/lib/state/sessionState/sessionState"
import usersState from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/unauthorized", "/404"]

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const session = useSnapshot(sessionState)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Check if the current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || "") || pathname === "/"

  // Function to check authentication status
  const checkAuth = (): boolean => {
    // Check if token exists and is not expired
    if (session.token && session.expiration) {
      const expirationTime = Number.parseInt(session.expiration, 10)
      const isValid = expirationTime > Date.now()
      return isValid
    }
    return false
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await usersState.login(email, password)

      if (usersState.success && usersState.loginMessage?.token) {
        setIsAuthenticated(true)

        // Set basic user info from the email
        setUser({
          email: email,
          // Add any other user info you want to store
        })

        // --- Set cookies for server-side auth ---
        const { token, accessToken, refreshToken, expiration } = usersState.loginMessage
        if (typeof window !== "undefined") {
          // Set cookies (not HTTP-only, but accessible to middleware)
          document.cookie = `token=${token}; path=/;`;
          document.cookie = `accToken=${accessToken}; path=/;`;
          document.cookie = `refreshToken=${refreshToken}; path=/;`;
          // expiration is in seconds, convert to ms and add to Date.now()
          const expirationMs = Date.now() + (Number(expiration) * 1000);
          document.cookie = `expiration=${expirationMs}; path=/;`;
        }
        // --- End set cookies ---

        toast({
          title: "Login successful",
          description: "Welcome to AFFINITY",
        })

        return true
      } else {
        setIsAuthenticated(false)
        toast({
          title: "Login failed",
          description: usersState.error || "Invalid credentials",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      setIsAuthenticated(false)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle logout
  const logout = () => {
    // First clear the authentication state
    usersState.logout()
    setIsAuthenticated(false)
    setUser(null)

    // --- Clear cookies for server-side auth ---
    if (typeof window !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "accToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "expiration=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      // Debug: log cookies after clearing
    }
    // --- End clear cookies ---

    // Show toast notification
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
    })

    // Use a small timeout to ensure state is cleared before navigation
    setTimeout(() => {
      window.location.href = "/login";
    }, 10)
  }

  // Debug: log auth state on mount and when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const authStatus = checkAuth()
    setIsAuthenticated(authStatus)

    // If authenticated, set basic user info
    if (authStatus) {
      // We don't have user info from the token, so we'll just set a placeholder
      // In a real app, you might decode the JWT token to get user info
      setUser({ isLoggedIn: true })
    } else {
      setUser(null)
    }

    setIsLoading(false)

    // If not authenticated and trying to access a protected route, redirect to unauthorized
    if (!authStatus && !isPublicRoute) {
      router.push("/unauthorized")
    }
  }, [pathname, session.token, session.expiration])

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Prevent hydration mismatch by not rendering until client-side
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
