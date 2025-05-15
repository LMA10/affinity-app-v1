/**
 * Format SQL query with proper indentation and line breaks
 * @param sql SQL query to format
 * @returns Formatted SQL query
 */
export function formatSql(sql: string): string {
  // Remove extra whitespace while preserving string literals
  sql = sql.trim()

  // Keywords to capitalize - updated from guide
  const keywords = [
    // Basic clauses
    "SELECT", "FROM", "WHERE", "AND", "OR", "GROUP BY", "ORDER BY", 
    "HAVING", "LIMIT", "OFFSET",
    
    // JOINs
    "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "NATURAL",
    
    // Operators
    "BETWEEN", "IN", "IS", "NULL", "NOT", "LIKE", "DISTINCT",
    
    // Functions from guide
    "COUNT", "SUM", "AVG", "MIN", "MAX", "ARRAY_AGG", "from_iso8601_timestamp",
    "DATE_TRUNC", "TO_CHAR", "TO_DATE", "CAST", "COALESCE", "NULLIF",
    "EXTRACT", "INTERVAL",
    
    // Time functions
    "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP",
    
    // Case expressions
    "CASE", "WHEN", "THEN", "ELSE", "END",
    
    // Window functions
    "OVER", "PARTITION BY", "ROW_NUMBER", "RANK", "DENSE_RANK",
    
    // Aggregation modifiers
    "FILTER", "DESC", "ASC"
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
  function formatMainQuery(query: string): string {
    // Format SELECT clause with proper indentation for columns
    query = query.replace(/SELECT\s+/i, "SELECT\n  ")
    
    // Format FROM clause
    query = query.replace(/\s+FROM\s+/i, "\nFROM ")

    // Format WHERE clause with proper indentation for conditions
    query = query.replace(/\s+WHERE\s+/i, "\nWHERE ")
    query = query.replace(/\s+(AND|OR)\s+/gi, "\n  $1 ")

    // Format JOIN clauses with proper alignment
    query = query.replace(/\s+(LEFT|RIGHT|INNER|OUTER|CROSS|FULL)?\s*JOIN\s+/gi, "\n$1 JOIN ")
    query = query.replace(/\s+ON\s+/gi, "\n  ON ")

    // Format GROUP BY clause with proper column alignment
    query = query.replace(/\s+GROUP\s+BY\s+/i, "\nGROUP BY\n  ")

    // Format ORDER BY clause with proper column alignment
    query = query.replace(/\s+ORDER\s+BY\s+/i, "\nORDER BY\n  ")

    // Format HAVING clause
    query = query.replace(/\s+HAVING\s+/i, "\nHAVING ")

    // Format LIMIT and OFFSET
    query = query.replace(/\s+LIMIT\s+/i, "\nLIMIT ")
    query = query.replace(/\s+OFFSET\s+/i, "\nOFFSET ")

    // Format commas in SELECT, GROUP BY, and ORDER BY clauses
    query = query.replace(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/g, ",\n  ")

    // Format CASE statements with proper indentation
    query = query.replace(/CASE\s+WHEN/gi, "CASE\n    WHEN")
    query = query.replace(/WHEN\s+/gi, "WHEN ")
    query = query.replace(/THEN\s+/gi, " THEN ")
    query = query.replace(/ELSE\s+/gi, "\n    ELSE ")
    query = query.replace(/END/gi, "\n  END")

    // Format BETWEEN statements
    query = query.replace(/BETWEEN\s+(.+?)\s+AND\s+/gi, "BETWEEN $1 AND ")

    // Format function calls with proper spacing
    query = formatFunctions(query)

    return query
  }

  // Helper function to format nested functions
  function formatFunctions(query: string): string {
    // Format timestamp functions
    query = query.replace(/from_iso8601_timestamp\s*\(\s*/gi, "from_iso8601_timestamp(")
    query = query.replace(/date_trunc\s*\(\s*'([^']+)'\s*,\s*/gi, "date_trunc('$1', ")
    
    // Format aggregate functions
    query = query.replace(/(COUNT|SUM|AVG|MIN|MAX|ARRAY_AGG)\s*\(\s*/gi, "$1(")
    query = query.replace(/DISTINCT\s+/gi, "DISTINCT ")
    
    // Format CAST with proper spacing
    query = query.replace(/CAST\s*\(\s*([^\s]+)\s+AS\s+([^)]+)\)/gi, "CAST($1 AS $2)")
    
    // Format window functions
    query = query.replace(/OVER\s*\(\s*/gi, "OVER (")
    query = query.replace(/PARTITION\s+BY\s*/gi, "PARTITION BY ")
    
    return query
  }

  // Handle WITH clause (CTEs)
  if (sql.toUpperCase().includes("WITH ")) {
    const mainSelectPos = sql.toUpperCase().indexOf("SELECT", sql.toUpperCase().indexOf(")"))
    if (mainSelectPos !== -1) {
      const ctePart = sql.substring(0, mainSelectPos)
      const mainPart = sql.substring(mainSelectPos)

      // Format CTE part
      let formattedCte = ctePart
        .replace(/([a-zA-Z0-9_]+)\s+AS\s+\(/gi, "$1 AS (")
        .replace(/AS\s+\(/g, "AS (\n  ")
        .replace(/\)\s*,\s*/g, ")\n\n, ")

      // Format main part
      const formattedMain = formatMainQuery(mainPart)

      sql = formattedCte + "\n\n" + formattedMain
    }
  } else {
    sql = formatMainQuery(sql)
  }

  // Add semicolon at the end if not present
  if (!sql.trim().endsWith(";")) {
    sql += ";"
  }

  return sql
}
