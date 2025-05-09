import React from "react"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}

export function IconButton({ children, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={`h-12 w-12 flex items-center justify-center bg-[#101918] border border-[#253136] rounded-[8px] text-white hover:bg-[#182325] transition ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 