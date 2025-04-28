"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Clock, Check, AlertCircle, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QueryStatus } from "@/components/logs/query-editor"
import { useTheme } from "next-themes"

interface QueryTabProps {
  id: string
  name: string
  status: QueryStatus
  isActive: boolean
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
  onRename?: (id: string, newName: string) => void
}

export function QueryTab({ id, name, status, isActive, onClick, onClose, onRename }: QueryTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (onRename) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    if (onRename && editedName.trim() !== "") {
      onRename(id, editedName)
    } else {
      setEditedName(name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (onRename && editedName.trim() !== "") {
        onRename(id, editedName)
      }
      setIsEditing(false)
    } else if (e.key === "Escape") {
      setEditedName(name)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        "group flex h-10 min-w-[120px] max-w-[200px] items-center justify-between border-r relative",
        isDarkTheme
          ? isActive
            ? "bg-[#0a1419] text-orange-500 border-orange-600/20"
            : "border-orange-600/20 hover:bg-[#0a1419]/50"
          : isActive
            ? "bg-white text-orange-600 border-gray-200 shadow-sm"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700",
      )}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center overflow-hidden px-4">
        {status === "running" && (
          <Clock className={`mr-2 h-4 w-4 ${isDarkTheme ? "text-orange-500" : "text-orange-600"}`} />
        )}
        {status === "completed" && <Check className="mr-2 h-4 w-4 text-green-500" />}
        {status === "error" && <AlertCircle className="mr-2 h-4 w-4 text-red-500" />}

        {isEditing ? (
          <input
            ref={inputRef}
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent border-none outline-none ${isDarkTheme ? "text-white" : "text-gray-800"} focus:ring-1 focus:ring-orange-500 rounded px-1`}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{name}</span>
        )}
      </div>

      {onRename && !isEditing && (
        <div
          className={`absolute right-10 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkTheme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </div>
      )}

      <button
        className={`mr-2 rounded-sm opacity-0 ring-offset-background transition-opacity ${
          isDarkTheme ? "hover:bg-orange-600/20 focus:ring-orange-600" : "hover:bg-orange-100 focus:ring-orange-500"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 group-hover:opacity-100`}
        onClick={onClose}
      >
        <X className={`h-4 w-4 ${isDarkTheme ? "" : "text-gray-600"}`} />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
