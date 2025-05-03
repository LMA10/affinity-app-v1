"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function Modal({ isOpen, onClose, title, children, className, showCloseButton = true }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "sm:max-w-[425px]",
          "max-h-[90vh] overflow-y-auto p-0 sm:p-6 w-full sm:w-auto h-full sm:h-auto",
          "rounded-none sm:rounded-lg",
          className
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background p-4 sm:p-0 border-b border-border">
          <DialogTitle>{title}</DialogTitle>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </DialogHeader>
        <div className="p-4 sm:p-0">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
