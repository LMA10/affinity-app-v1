"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, BarChart3, BookOpen, Cloud, Cog, FileText, LogOut, ChevronDown, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import userService from "@/lib/services/userService"
import { useSnapshot } from "valtio"
import adminState from "@/lib/state/admin/adminState"
import { useAuth } from "@/lib/context/auth-context"
import { ThemedLogo } from "@/components/ThemedLogo"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { pageVisibility } = useSnapshot(adminState)
  const [openSections, setOpenSections] = useState({
    analytics: true,
    cloudStatus: false,
    management: false,
  })
  const { logout } = useAuth()

  // Determine which section should be open based on the current path
  useEffect(() => {
    if (pathname?.includes("/analytics")) {
      setOpenSections((prev) => ({ ...prev, analytics: true }))
    } else if (pathname?.includes("/cloud")) {
      setOpenSections((prev) => ({ ...prev, cloudStatus: true }))
    } else if (pathname?.includes("/management")) {
      setOpenSections((prev) => ({ ...prev, management: true }))
    }
  }, [pathname])

  const toggleSection = (section: "analytics" | "cloudStatus" | "management") => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Common styles for menu items
  const menuItemStyles = "uppercase tracking-wide text-sm font-medium font-['Helvetica']"
  const menuIconStyles = "h-5 w-5 ml-4 mr-2 shrink-0"
  const subMenuItemStyles = "uppercase tracking-wide text-xs font-medium font-['Helvetica']"

  const handleLogout = () => {
    logout()

    // Show a toast notification
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
    })

    // Redirect to login page
    router.push("/")
  }

  // Check if a page should be visible
  const isPageVisible = (path: string) => {
    return adminState.isPageVisible(path)
  }

  // Check if any page in a section is visible
  const isSectionVisible = (paths: string[]) => {
    return paths.some((path) => isPageVisible(path))
  }

  // Define section paths for visibility checks
  const analyticsPaths = [
    "/analytics",
    "/analytics/aws",
    "/analytics/github",
    "/analytics/azure",
    "/analytics/gcp",
    "/analytics/agents",
  ]

  const cloudStatusPaths = ["/cloud/aws", "/cloud/github", "/cloud/azure", "/cloud/gcp"]

  const managementPaths = [
    "/management/integrations",
    "/management/notifications",
    "/management/agents",
    "/management/users",
  ]

  // Get the logged-in user's email from localStorage
  let userEmail = ""
  if (typeof window !== "undefined") {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '[]')
      userEmail = currentUser[1] || ""
    } catch { }
  }

  return (
    <Sidebar className="dark:!bg-[#142A33] !bg-[#CAD0D2] border-r dark:border-orange-500 border-transparent">
      <div className="absolute right-0 top-8 translate-x-1/2 z-20 dark:!bg-[#142A33] !bg-[#CAD0D2] rounded-md p-0.5 shadow-md flex border border-orange-500">
        <SidebarTrigger className="h-7 w-6 dark:text-orange-500 text-[#142A33] flex items-center justify-center font-['IBM_Plex_Mono'] text-lg -translate-y-0.5" />
      </div>
      <SidebarHeader className="dark:!bg-[#142A33] !bg-[#CAD0D2]">
        <div className="flex items-center p-4 translate-x-[30px]">
          <Link href="/alerts-view" className="flex items-center gap-2">
            <ThemedLogo width={138} height={46} className="object-contain" />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-0 dark:!bg-[#142A33] !bg-[#CAD0D2] overflow-x-hidden">
        <SidebarMenu className="space-y-0 translate-x-[30px] overflow-x-hidden">
          {/* LOGS Section */}
          {isPageVisible("/logs") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/logs"}
                className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
              >
                <Link href="/logs" className="dark:text-orange-500 text-[#142A33] flex items-center w-full">
                  <FileText className={`h-5 w-5 ml-4 mr-1 shrink-0 dark:text-orange-500 text-[#142A33]`} />
                  <span>LOGS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* ALERTS Section */}
          {isPageVisible("/alerts") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/alerts"}
                className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
              >
                <Link href="/alerts-view" className="dark:text-orange-500 text-[#142A33] flex items-center w-full">
                  <AlertTriangle className={`h-5 w-5 ml-4 mr-1 shrink-0 dark:text-orange-500 text-[#142A33]`} />
                  <span>ALERTS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* WIKI Section */}
          {/* {isPageVisible("/wiki") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/wiki"}
                className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
              >
                <Link href="/wiki" className="text-orange-500 flex items-center w-full">
                  <BookOpen className={menuIconStyles} />
                  <span>WIKI</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )} */}

          {/* LEGAL Section */}
          {/* {isPageVisible("/legal") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/legal"}
                className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
              >
                <Link href="/legal" className="text-orange-500 flex items-center w-full">
                  <FileText className={menuIconStyles} />
                  <span>LEGAL</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )} */}

          {/* MANAGEMENT Section - moved below LEGAL */}
          {isSectionVisible(managementPaths) && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`w-full dark:text-orange-500 text-[#142A33] flex items-center py-2.5 px-4 ${menuItemStyles}`}
                onClick={() => toggleSection("management")}
              >
                <Cog className={`h-5 w-5 ml-4 mr-1 shrink-0 dark:text-orange-500 text-[#142A33]`} />
                <span>MANAGEMENT</span>
                <ChevronDown
                  className={`ml-2 h-4 w-4 shrink-0 dark:text-orange-500 text-[#142A33] transition-transform duration-200 ${openSections.management ? "rotate-180" : ""}`}
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {openSections.management && isSectionVisible(managementPaths) && (
            <SidebarMenuSub className="ml-4 pl-4">
              {isPageVisible("/management/integrations") && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/management/integrations"}
                    className={`py-2 ${menuItemStyles} dark:text-orange-500 text-[#142A33]`}
                  >
                    <Link href="/management/integrations">INTEGRATIONS</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}

              {isPageVisible("/management/notifications") && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/management/notifications"}
                    className={`py-2 ${menuItemStyles} dark:text-orange-500 text-[#142A33]`}
                  >
                    <Link href="/management/notifications">NOTIFICATIONS</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}

              {isPageVisible("/management/users") && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/management/users"}
                    className={`py-2 ${menuItemStyles} dark:text-orange-500 text-[#142A33]`}
                  >
                    <Link href="/management/users">USERS</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="dark:!bg-[#142A33] !bg-[#CAD0D2]">
        {userEmail && (
          <div className="flex items-center justify-between px-4">
            <div>
              <div className="text-[10px] text-[#506C77] mb-1 font-['IBM_Plex_Mono'] font-normal">Signed in as</div>
              <div className="text-xs dark:text-[#EA661B] text-[#142A33] mb-2 truncate" title={userEmail}>
                {userEmail}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="dark:text-orange-500 text-[#142A33] hover:opacity-80 transition-colors group-data-[state=collapsed]:hidden"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
