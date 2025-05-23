"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { AlertDetails } from "@/components/alert-details"

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
        <div className={`flex-1 transition-all duration-300 ${isOpen ? "mr-[400px]" : ""}`}>{children}</div>
        {isOpen && selectedAlert && (
          <div className="fixed top-0 right-0 h-full w-[400px] bg-[#0f1d24] border-l border-orange-600/20 overflow-auto">
            <AlertDetails alert={selectedAlert} onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </AlertDetailsContext.Provider>
  )
}
