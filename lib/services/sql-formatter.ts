/**
 * Format SQL query with proper indentation and line breaks
 * @param sql SQL query to format
 * @returns Formatted SQL query
 */
export function formatSql(sql: string): string {
  // Remove extra whitespace while preserving string literals
  sql = sql.trim()

  // Keywords to capitalize
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "LIMIT",
    "OFFSET",
    "UNION",
    "ALL",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "TRUNCATE",
    "AS",
    "ON",
    "BETWEEN",
    "IN",
    "IS",
    "NULL",
    "NOT",
    "LIKE",
    "DISTINCT",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "WITH",
    "CTE",
    "OVER",
    "PARTITION BY",
    "ROW_NUMBER",
    "RANK",
    "DENSE_RANK",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "CAST",
    "COALESCE",
    "NULLIF",
    "EXTRACT",
    "INTERVAL",
    "DATE_TRUNC",
    "TO_CHAR",
    "TO_DATE",
    "TIMESTAMP",
    "ARRAY_AGG",
    "STRING_AGG",
    "JSONB_AGG",
    "LATERAL",
    "CROSS",
    "NATURAL",
    "USING",
    "EXISTS",
    "ANY",
    "ALL",
    "SOME",
    "INTERSECT",
    "EXCEPT",
    "WINDOW",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "SESSION_USER",
    "IF",
    "COUNT_IF",
    "FILTER",
    "DESC",
    "ASC",
    "ROUND",
  ]

  // Function to capitalize SQL keywords while preserving quoted identifiers and string literals
  function capitalizeKeywords(sql: string): string {
    let result = ""
    let inSingleQuote = false
    let inDoubleQuote = false
    let currentWord = ""

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i]

      // Handle quotes
      if (char === "'" && (i === 0 || sql[i - 1] !== "\\")) {
        inSingleQuote = !inSingleQuote
        result += char
        continue
      }

      if (char === '"' && (i === 0 || sql[i - 1] !== "\\")) {
        inDoubleQuote = !inDoubleQuote
        result += char
        continue
      }

      // If inside quotes, just append the character
      if (inSingleQuote || inDoubleQuote) {
        result += char
        continue
      }

      // Handle word boundaries
      if (/[a-zA-Z0-9_]/.test(char)) {
        currentWord += char
      } else {
        // Word is complete, check if it's a keyword
        if (currentWord) {
          const upperWord = currentWord.toUpperCase()
          if (keywords.includes(upperWord)) {
            result += upperWord
          } else {
            result += currentWord
          }
          currentWord = ""
        }
        result += char
      }
    }

    // Handle the last word
    if (currentWord) {
      const upperWord = currentWord.toUpperCase()
      if (keywords.includes(upperWord)) {
        result += upperWord
      } else {
        result += currentWord
      }
    }

    return result
  }

  // First pass: capitalize keywords
  sql = capitalizeKeywords(sql)

  // Second pass: format the query structure

  // Handle WITH clause (CTEs)
  if (sql.includes("WITH ")) {
    // Format the WITH clause
    sql = sql.replace(/WITH\s+/i, "WITH ")

    // Find the position of the main SELECT after the CTE
    const mainSelectPos = sql.indexOf("SELECT", sql.indexOf(")"))
    if (mainSelectPos !== -1) {
      // Split into CTE part and main query part
      const ctePart = sql.substring(0, mainSelectPos)
      const mainPart = sql.substring(mainSelectPos)

      // Format CTE part
      let formattedCte = ctePart.replace(/([a-zA-Z0-9_]+)\s+AS\s+\(/gi, "$1 AS (").replace(/AS\s+\(/g, "AS (\n  ")

      // Add line breaks between CTEs
      formattedCte = formattedCte.replace(/\)\s*,\s*/g, ")\n\n, ")

      // Format main part
      const formattedMain = formatMainQuery(mainPart)

      // Combine
      sql = formattedCte + "\n\n" + formattedMain
    }
  } else {
    // No CTE, just format the main query
    sql = formatMainQuery(sql)
  }

  // Add semicolon at the end if not present
  if (!sql.trim().endsWith(";")) {
    sql += ";"
  }

  return sql

  // Helper function to format the main part of the query
  function formatMainQuery(query: string): string {
    // Format SELECT clause
    query = query.replace(/SELECT\s+/i, "SELECT\n  ")

    // Format FROM clause
    query = query.replace(/\s+FROM\s+/i, "\nFROM ")

    // Format WHERE clause
    query = query.replace(/\s+WHERE\s+/i, "\nWHERE ")

    // Format AND/OR conditions with proper indentation
    query = query.replace(/\s+(AND|OR)\s+/gi, "\n  $1 ")

    // Format JOIN clauses
    query = query.replace(/\s+(LEFT|RIGHT|INNER|OUTER|CROSS|FULL)?\s*JOIN\s+/gi, "\n$1 JOIN ")

    // Format GROUP BY clause
    query = query.replace(/\s+GROUP\s+BY\s+/i, "\nGROUP BY\n  ")

    // Format ORDER BY clause
    query = query.replace(/\s+ORDER\s+BY\s+/i, "\nORDER BY\n  ")

    // Format HAVING clause
    query = query.replace(/\s+HAVING\s+/i, "\nHAVING ")

    // Format LIMIT clause
    query = query.replace(/\s+LIMIT\s+/i, "\nLIMIT ")

    // Format OFFSET clause
    query = query.replace(/\s+OFFSET\s+/i, "\nOFFSET ")

    // Format UNION clause
    query = query.replace(/\s+UNION(\s+ALL)?\s+/i, "\nUNION$1\n")

    // Format commas in SELECT clause
    query = query.replace(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/g, ",\n  ")

    // Format CASE statements
    query = query.replace(/CASE\s+WHEN/gi, "CASE\n    WHEN")
    query = query.replace(/WHEN\s+/gi, "WHEN ")
    query = query.replace(/THEN\s+/gi, " THEN ")
    query = query.replace(/ELSE\s+/gi, "\n    ELSE ")
    query = query.replace(/END/gi, "\n  END")

    // Format BETWEEN statements
    query = query.replace(/BETWEEN\s+(.+?)\s+AND\s+/gi, "BETWEEN $1 AND ")

    // Format multiple columns in GROUP BY and ORDER BY
    query = query.replace(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/g, ",\n  ")

    // Format nested functions
    query = formatNestedFunctions(query)

    return query
  }

  // Helper function to format nested functions
  function formatNestedFunctions(query: string): string {
    // This is a simplified approach - a full parser would be better for complex nested functions
    // Format common functions with multiple arguments
    const functionPatterns = [
      { pattern: /(COUNT_IF|COUNT|SUM|AVG|MIN|MAX|ROUND)\s*\(/gi, replacement: "$1(" },
      { pattern: /(DATE_TRUNC)\s*\(\s*'([^']+)'\s*,\s*/gi, replacement: "$1('$2', " },
      { pattern: /(CAST)\s*$$\s*([^\s]+)\s+AS\s+([^$$]+)\)/gi, replacement: "$1($2 AS $3)" },
      { pattern: /(ARRAY_AGG|STRING_AGG|JSONB_AGG)\s*\(\s*DISTINCT\s+/gi, replacement: "$1(DISTINCT " },
    ]

    for (const { pattern, replacement } of functionPatterns) {
      query = query.replace(pattern, replacement)
    }

    return query
  }
}
