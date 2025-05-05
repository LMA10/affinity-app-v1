"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { Loading } from "@/components/loading"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if on the root path
    if (pathname === "/" && !isLoading) {
      if (isAuthenticated) {
        router.replace("/alerts-view")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a1419]">
        <Loading />
      </div>
    )
  }

  return null
}


