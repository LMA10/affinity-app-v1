"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
            </button>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
