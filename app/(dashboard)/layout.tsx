"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavButton } from "@/components/mobile-nav-button"
import { AlertDetailsProvider } from "@/components/alert-details-provider"
import { DateRangeProvider } from "@/components/date-range-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/context/auth-context"
import { Loading } from "@/components/loading"
import { ThemeProvider } from "@/components/theme-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page instead of unauthorized
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a1419]">
        <Loading />
      </div>
    )
  }

  // Don't render the dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <DateRangeProvider>
        <SidebarProvider defaultOpen={true}>
          <AlertDetailsProvider>
            <div className="flex h-screen w-full bg-[#0a1419] dark:bg-[#0a1419] light:bg-slate-50">
              <AppSidebar />
              <div className="flex-1 flex flex-col overflow-auto relative">
                <MobileNavButton />
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </AlertDetailsProvider>
        </SidebarProvider>
      </DateRangeProvider>
    </ThemeProvider>
  )
}
