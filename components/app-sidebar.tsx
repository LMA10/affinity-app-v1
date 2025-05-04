"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, BarChart3, BookOpen, Cloud, Cog, FileText, LogOut, ChevronDown, Settings, Search } from "lucide-react"
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
  const menuItemStyles = "uppercase tracking-wide text-sm font-medium"
  const menuIconStyles = "h-5 w-5 mr-3 shrink-0"
  const subMenuItemStyles = "uppercase tracking-wide text-xs font-medium"

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
    <Sidebar className="border-r border-orange-600/20 bg-[#0a1419]">
      <div className="absolute right-0 top-4 translate-x-1/2 z-20 bg-sidebar rounded-full p-1 shadow-md border border-sidebar-border hidden group-data-[state=collapsed]:flex">
        <SidebarTrigger className="h-6 w-6 text-orange-500" />
      </div>
      <SidebarHeader className="border-b border-orange-600/20">
        <div className="flex items-center p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="https://i-p.rmcdn.net/65ddfccea1d4fc00527217ce/4650992/image-97f8a95d-10b0-4809-a322-2432385dc369.png?w=1707&e=webp&nll=true&cX=813&cY=282&cW=1154&cH=491"
              alt="Affinity Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </Link>
          <SidebarTrigger className="ml-auto text-orange-500" />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu className="space-y-1">
          {/* LOGS Section */}
          {isPageVisible("/logs") && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/logs"}
                className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
              >
                <Link href="/logs" className="text-orange-500 flex items-center w-full">
                  <FileText className={menuIconStyles} />
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
                <Link href="/alerts-view" className="text-orange-500 flex items-center w-full">
                  <AlertTriangle className={menuIconStyles} />
                  <span>ALERTS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* INCIDENT RESPONSE Section */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/threat-hunting"}
              className={`flex items-center py-2.5 px-4 ${menuItemStyles}`}
            >
              <Link href="/threat-hunting" className="text-orange-500 flex items-center w-full">
                <Search className={menuIconStyles} />
                <span>THREAT HUNTING</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

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
                className={`w-full text-orange-500 flex items-center py-2.5 px-4 ${menuItemStyles}`}
                onClick={() => toggleSection("management")}
              >
                <Cog className={menuIconStyles} />
                <span>MANAGEMENT</span>
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 text-orange-500 transition-transform duration-200 ${openSections.management ? "rotate-180" : ""
                    }`}
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {openSections.management && isSectionVisible(managementPaths) && (
            <SidebarMenuSub className="ml-4 pl-4 border-l border-orange-600/20">
              {isPageVisible("/management/integrations") && (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/management/integrations"}
                    className={`py-2 ${subMenuItemStyles}`}
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
                    className={`py-2 ${subMenuItemStyles}`}
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
                    className={`py-2 ${subMenuItemStyles}`}
                  >
                    <Link href="/management/users">USERS</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-orange-600/20 p-4">
        {userEmail && (
          <>
            <div className="text-[10px] text-orange-400 mb-1">Signed in as</div>
            <div className="text-xs text-orange-300 mb-2 truncate" title={userEmail}>
              {userEmail}
            </div>
          </>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className={`flex items-center py-2.5 px-4 ${menuItemStyles} text-orange-500 w-full`}
            >
              <LogOut className={menuIconStyles} />
              <span>LOGOUT</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
