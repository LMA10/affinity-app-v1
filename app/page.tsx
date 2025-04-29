"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Loading } from "@/components/loading"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !isLoading) {
      if (isAuthenticated) {
        redirect("/alerts-view")
      } else {
        redirect("/login")
      }
    }
  }, [isAuthenticated, isLoading, isClient])

  if (!isClient) {
    return null
  }

  // Show loading state while checking authentication
  return (
    <div className="flex h-screen items-center justify-center bg-[#0a1419]">
      <Loading />
    </div>
  )
}
