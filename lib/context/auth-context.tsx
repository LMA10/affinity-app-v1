"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import sessionState from "@/lib/state/sessionState/sessionState"
import usersState from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"

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
  const session = useSnapshot(sessionState)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)

  // Function to check authentication status
  const checkAuth = (): boolean => {
    if (session.token && session.expiration) {
      const expirationTime = Number.parseInt(session.expiration, 10)
      return expirationTime > Date.now()
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
        setUser({ email })
        return true
      } else {
        setIsAuthenticated(false)
        return false
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    if (sessionState.clearSession) sessionState.clearSession()
    usersState.logout()
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userGroups')
    sessionStorage.clear()
    window.location.replace("/login")
  }

  // Initial auth check
  useEffect(() => {
    const authStatus = checkAuth()
    setIsAuthenticated(authStatus)
    setUser(authStatus ? { isLoggedIn: true } : null)
    setIsLoading(false)
  }, [session.token, session.expiration])

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
