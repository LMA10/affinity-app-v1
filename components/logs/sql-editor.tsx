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

    // Define token types
    const keywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "AND",
      "OR",
      "ORDER",
      "BY",
      "GROUP",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "JOIN",
      "LEFT",
      "RIGHT",
      "INNER",
      "OUTER",
      "UNION",
      "ALL",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "ALTER",
      "DROP",
      "TABLE",
      "VIEW",
      "INDEX",
      "DISTINCT",
      "AS",
      "ON",
      "BETWEEN",
      "IN",
      "IS",
      "NULL",
      "NOT",
      "LIKE",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
    ]

    const functions = [
      "COUNT",
      "SUM",
      "AVG",
      "MIN",
      "MAX",
      "COALESCE",
      "NULLIF",
      "CAST",
      "EXTRACT",
      "DATE_TRUNC",
      "TO_CHAR",
      "TO_DATE",
      "ROUND",
    ]

    const operators = ["+", "-", "*", "/", "=", "<>", "!=", ">", "<", ">=", "<=", "||"]

    // Process tokens and apply appropriate classes
    return tokens.map((token, index) => {
      // Check if token is a keyword
      if (keywords.includes(token.toUpperCase())) {
        return (
          <span key={index} className={isDarkTheme ? "text-blue-400 font-semibold" : "text-blue-600 font-semibold"}>
            {token}
          </span>
        )
      }

      // Check if token is a function
      if (functions.some((fn) => token.toUpperCase().startsWith(fn))) {
        return (
          <span key={index} className={isDarkTheme ? "text-yellow-400" : "text-amber-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a number
      if (/^\d+(\.\d+)?$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-purple-400" : "text-purple-600"}>
            {token}
          </span>
        )
      }

      // Check if token is a string literal (starts and ends with single quote)
      if (/^'.*'$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-green-400" : "text-green-600"}>
            {token}
          </span>
        )
      }

      // Check if token is an identifier (starts and ends with double quote)
      if (/^".*"$/.test(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-orange-400" : "text-orange-600"}>
            {token}
          </span>
        )
      }

      // Check if token is an operator
      if (operators.includes(token)) {
        return (
          <span key={index} className={isDarkTheme ? "text-red-400" : "text-red-600"}>
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
      {error && status === "error" && (
        <div
          className={`mt-2 p-2 ${isDarkTheme ? "bg-red-950/20 border-red-800" : "bg-red-50 border-red-300"} border rounded-md`}
        >
          <p className={`text-sm ${isDarkTheme ? "text-red-400" : "text-red-600"}`}>{error}</p>
        </div>
      )}
    </div>
  )
}
