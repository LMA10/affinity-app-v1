"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

export function MobileNavButton() {
  const { toggleSidebar } = useSidebar()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`fixed top-4 right-4 z-50 md:hidden bg-[#0a1419]/80 backdrop-blur-sm border border-orange-600/20 ${isDark ? "text-orange-500" : "text-orange-600"} hover:bg-[#0a1419] hover:text-orange-400`}
      onClick={toggleSidebar}
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
