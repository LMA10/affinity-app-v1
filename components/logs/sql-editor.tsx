"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import type { QueryStatus } from "./query-editor"

interface SqlEditorProps {
  value: string
  onChange: (value: string) => void
  status?: QueryStatus
  error?: string | null
}

const SQL_KEYWORDS = {
  clauses: [
    "SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET"
  ],
  operators: [
    "AND", "OR", "IN", "NOT IN", "LIKE", "IS NULL", "IS NOT NULL", "BETWEEN", "EXISTS"
  ],
  functions: [
    "COUNT", "SUM", "AVG", "MIN", "MAX", "ARRAY_AGG", "from_iso8601_timestamp",
    "DATE_TRUNC", "TO_CHAR", "TO_DATE", "CAST", "COALESCE", "NULLIF",
    "EXTRACT", "INTERVAL", "CURRENT_TIMESTAMP"
  ],
  joins: [
    "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "CROSS JOIN", "NATURAL JOIN"
  ],
  modifiers: [
    "DISTINCT", "ASC", "DESC"
  ]
};

export function SqlEditor({ value, onChange, status, error }: SqlEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const highlightedRef = useRef<HTMLPreElement>(null)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  // Auto-resize the textarea
  useEffect(() => {
    const textarea = editorRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(200, textarea.scrollHeight)}px`
    }
  }, [value])

  // Sync scroll between textarea and highlighted code
  useEffect(() => {
    const textarea = editorRef.current
    const highlighted = highlightedRef.current

    if (!textarea || !highlighted) return

    const syncScroll = () => {
      highlighted.scrollTop = textarea.scrollTop
      highlighted.scrollLeft = textarea.scrollLeft
    }

    textarea.addEventListener("scroll", syncScroll)
    return () => textarea.removeEventListener("scroll", syncScroll)
  }, [])

  // Apply syntax highlighting
  const getHighlightedCode = () => {
    if (!value) return []

    // Split the input by spaces and newlines to tokenize
    const tokens = value.split(/(\s+|[.,(){}[\];])/g).filter(Boolean)

    // Process tokens and apply appropriate classes
    return tokens.map((token, index) => {
      const upperToken = token.toUpperCase()

      // Check if token is a clause
      if (SQL_KEYWORDS.clauses.includes(upperToken)) {
        return (
          <span key={index} className={`${isDarkTheme ? "text-blue-400" : "text-blue-600"} font-bold`}>
            {token}
          </span>
        )
      }

      // Check if token is an operator
      if (SQL_KEYWORDS.operators.includes(upperToken)) {
        return (
          <span key={index} className={isDarkTheme ? "text-purple-400" : "text-purple-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a function
      if (SQL_KEYWORDS.functions.some(fn => upperToken.startsWith(fn))) {
        return (
          <span key={index} className={isDarkTheme ? "text-yellow-400" : "text-yellow-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a join
      if (SQL_KEYWORDS.joins.some(join => upperToken.includes(join))) {
        return (
          <span key={index} className={`${isDarkTheme ? "text-green-400" : "text-green-600"} font-semibold`}>
            {token}
          </span>
        )
      }

      // Check if token is a modifier
      if (SQL_KEYWORDS.modifiers.includes(upperToken)) {
        return (
          <span key={index} className={isDarkTheme ? "text-pink-400" : "text-pink-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a number
      if (/^\d+(\.\d+)?$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-cyan-400" : "text-cyan-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a string literal (starts and ends with single quote)
      if (/^'.*'$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-orange-400" : "text-orange-600"}>
            {token}
          </span>
        )
      }

      // Check if token is an identifier (starts and ends with double quote)
      if (/^".*"$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-teal-400" : "text-teal-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a special character
      if (/^[.,(){}[\];]$/.test(token)) {
        return (
          <span key={index} className="text-gray-400">
            {token}
          </span>
        )
      }

      // Default case
      return (
        <span key={index} className={isDarkTheme ? "text-white" : "text-gray-800"}>
          {token}
        </span>
      )
    })
  }

  return (
    <div
      className={`p-4 ${isDarkTheme ? "bg-[#0a1014]" : "bg-gray-50"} border-b ${isDarkTheme ? "border-orange-600/20" : "border-gray-200"} relative`}
    >
      <pre
        ref={highlightedRef}
        className={`absolute inset-0 p-4 pointer-events-none font-mono text-sm whitespace-pre-wrap overflow-auto ${isDarkTheme ? "text-white" : "text-gray-800"}`}
      >
        {getHighlightedCode()}
      </pre>
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-none outline-none resize-none text-sm font-mono ${isDarkTheme ? "text-transparent caret-white" : "text-transparent caret-gray-800"} min-h-[100px]`}
        placeholder="Enter your SQL query here..."
        spellCheck={false}
      />
    </div>
  )
}
