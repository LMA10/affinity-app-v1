"use client"

import { useAuth } from "@/lib/context/auth-context"

export function useAdmin() {
  const { user } = useAuth()

  // In a real application, you would check if the user has admin role/permissions
  // For now, we'll assume all authenticated users are admins
  const isAdmin = !!user

  return { isAdmin }
}
