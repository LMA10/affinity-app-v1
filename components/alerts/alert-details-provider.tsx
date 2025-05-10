"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { AlertDetailsView } from "@/components/alerts/alert-details-view"

type AlertDetailsContextType = {
  selectedAlert: any | null
  setSelectedAlert: (alert: any | null) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const AlertDetailsContext = createContext<AlertDetailsContextType | undefined>(undefined)

export function useAlertDetails() {
  const context = useContext(AlertDetailsContext)
  if (!context) {
    throw new Error("useAlertDetails must be used within an AlertDetailsProvider")
  }
  return context
}

export function AlertDetailsProvider({ children }: { children: React.ReactNode }) {
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlertDetailsContext.Provider value={{ selectedAlert, setSelectedAlert, isOpen, setIsOpen }}>
      <div className="flex h-full w-full relative">
        <div className={`flex-1 transition-all duration-300 ${isOpen ? 'md:mr-[400px]' : ''}`}>{children}</div>
        {/* Mobile: Fullscreen modal, Desktop: Sidebar */}
        {isOpen && selectedAlert && (
          <>
            {/* Overlay for mobile modal */}
            <div className="fixed inset-0 bg-black/60 z-40 block md:hidden" onClick={() => setIsOpen(false)} />
            {/* Details panel: mobile = modal, desktop = sidebar */}
            <div
              className="fixed z-50 top-0 right-0 h-screen w-full md:w-[400px] bg-[#0f1d24] flex flex-col space-y-4 overflow-hidden transition-all duration-300 block md:block"
            >
              <AlertDetailsView alert={selectedAlert} onClose={() => setIsOpen(false)} />
            </div>
          </>
        )}
      </div>
    </AlertDetailsContext.Provider>
  )
}
