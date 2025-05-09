import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { ChangeEvent } from "react"

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SearchBar({ 
  placeholder = "Search...", 
  value, 
  onChange,
  className = ""
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-3 h-4 w-4 text-white dark:text-white text-[#506C77]" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`pl-10 !bg-[#CAD0D2] dark:!bg-[#0D1315] !border-none !text-[#506C77] dark:!text-white placeholder-[#506C77] dark:placeholder-white rounded-[8px] h-10 ${className}`}
        style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
      />
    </div>
  )
} 