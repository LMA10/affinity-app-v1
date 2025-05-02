"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNavButton } from "@/components/mobile-nav-button"
import { AlertDetailsProvider } from "@/components/alert-details-provider"
import { DateRangeProvider } from "@/components/date-range-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { useAuth } from "@/lib/context/auth-context"
import { Loading } from "@/components/loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { withAuth } from "@/lib/hoc/withAuth"

const DashboardLayoutComponent = function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (!isAuthenticated && typeof window !== 'undefined' && window.location.pathname !== '/login')) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a1419]">
        <Loading />
      </div>
    );
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
  );
}

export default withAuth(DashboardLayoutComponent)
