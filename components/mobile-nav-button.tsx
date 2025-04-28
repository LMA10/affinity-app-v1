"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function MobileNavButton() {
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 z-50 md:hidden bg-[#0a1419]/80 backdrop-blur-sm border border-orange-600/20 text-orange-500 hover:bg-[#0a1419] hover:text-orange-400"
      onClick={toggleSidebar}
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}
