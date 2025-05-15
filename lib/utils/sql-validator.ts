/**
 * SQL Validator - Checks for common SQL syntax errors and security issues
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

// List of disallowed or dangerous SQL keywords
const DANGEROUS_DDL_DML = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'TRUNCATE',
  'CREATE',
  'ALTER'
];

const SYSTEM_ADMIN_COMMANDS = [
  'GRANT',
  'REVOKE',
  'EXECUTE',
  'SET',
  'USE'
];

const POTENTIALLY_EXPLOITABLE = [
  'INFORMATION_SCHEMA',
  'PG_CATALOG',
  'MYSQL\\.',
  'SYS\\.',
  'DBA_',
  'ALL_',
  'USER_',
  'LOAD DATA',
  'EXPORT',
  'INTO OUTFILE'
];

// List of allowed SQL functions from the guide
const ALLOWED_FUNCTIONS = [
  'AND',
  'OR',
  'NOT',
  'LOWER',
  'UPPER',
  'CURRENT_TIMESTAMP',
  'INTERVAL',
  'ARRAY_AGG',
  'ARRAY',
  'STRING_AGG',
  'JSON_AGG',
  'JSON_OBJECT_AGG',
  'JSON_BUILD_OBJECT',
  'JSONB_BUILD_OBJECT',
  'DATE_TRUNC',
  'DATE_PART',
  'EXTRACT',
  'TIMEZONE',
  'TO_CHAR',
  'TO_DATE',
  'TO_TIMESTAMP',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'STDDEV',
  'VARIANCE',
  'from_iso8601_timestamp',
  'CURRENT_TIMESTAMP',
  'INTERVAL',
  'ARRAY_AGG',
  'ARRAY',
  'STRING_AGG',
  'JSON_AGG',
  'JSON_OBJECT_AGG',
  'JSON_BUILD_OBJECT',
  'JSONB_BUILD_OBJECT',
  'DATE_TRUNC',
  'DATE_PART',
  'EXTRACT',
  'TIMEZONE',
  'FROM_ISO8601_TIMESTAMP'
  
];

// Additional syntax validation patterns
const SYNTAX_PATTERNS = [
  { pattern: /'/g, mustBeEven: true, message: "Unbalanced single quotes" },
  { pattern: /"/g, mustBeEven: true, message: "Unbalanced double quotes" },
  { pattern: /\(/g, counterpart: /\)/g, message: "Unbalanced parentheses" },
  { pattern: /\{/g, counterpart: /\}/g, message: "Unbalanced curly braces" },
  { pattern: /\bBETWEEN\b/gi, mustHaveAfter: /\bAND\b/gi, message: "BETWEEN missing corresponding AND" },
  { pattern: /\bSELECT\b/i, required: true, message: "Query must start with SELECT" },
  { pattern: /\bFROM\b/i, required: true, message: "SELECT must include FROM clause" }
];

/**
 * Validates if a SQL query is secure and properly formatted
 */
export function validateSqlQuery(query: string): ValidationResult {
  if (!query || !query.trim()) {
    return { isValid: false, error: "SQL query cannot be empty" };
  }

  // Normalize the query for case-insensitive checks
  const normalizedQuery = query.toUpperCase();

  // Check for required SELECT and FROM clauses
  if (!normalizedQuery.includes('SELECT')) {
    return { isValid: false, error: "Query must start with SELECT" };
  }

  if (!normalizedQuery.includes('FROM')) {
    return { isValid: false, error: "SELECT must include FROM clause" };
  }

  // Check for DDL/DML statements
  for (const keyword of DANGEROUS_DDL_DML) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalizedQuery)) {
      return { 
        isValid: false, 
        error: `The ${keyword} statement is not allowed for security reasons` 
      };
    }
  }

  // Check for system/admin commands
  for (const keyword of SYSTEM_ADMIN_COMMANDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keyword === 'INTERVAL' && normalizedQuery.includes('INTERVAL')) {
      // Allow INTERVAL when used with timestamp arithmetic
      if (!normalizedQuery.match(/TIMESTAMP[\s\-\+]+INTERVAL|INTERVAL[\s\-\+\']+\d+/i)) {
        return { 
          isValid: false, 
          error: `The ${keyword} command is not allowed for security reasons` 
        };
      }
    } else if (regex.test(normalizedQuery)) {
      return { 
        isValid: false, 
        error: `The ${keyword} command is not allowed for security reasons` 
      };
    }
  }

  // Check for potentially exploitable patterns
  for (const keyword of POTENTIALLY_EXPLOITABLE) {
    const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(normalizedQuery)) {
      return { 
        isValid: false, 
        error: `Potentially unsafe query pattern detected: ${keyword}` 
      };
    }
  }

  

  // Check for proper function usage
  const functionMatches = query.match(/\b\w+\s*\(/g);
  if (functionMatches) {
    for (const match of functionMatches) {
      const func = match.replace(/[\s(]/g, '').toUpperCase();
      if (!ALLOWED_FUNCTIONS.includes(func)) {
        return {
          isValid: false,
          error: `Function "${func}" is not allowed. Use only approved functions.`
        };
      }
    }
  }

  // Check balanced syntax elements
  for (const pattern of SYNTAX_PATTERNS) {
    if (pattern.mustBeEven) {
      const matches = (query.match(pattern.pattern) || []).length;
      if (matches % 2 !== 0) {
        return { isValid: false, error: pattern.message };
      }
    } else if (pattern.counterpart) {
      const matches = (query.match(pattern.pattern) || []).length;
      const counterMatches = (query.match(pattern.counterpart) || []).length;
      if (matches !== counterMatches) {
        return { isValid: false, error: pattern.message };
      }
    } else if (pattern.mustHaveAfter) {
      const patternMatches = (normalizedQuery.match(pattern.pattern) || []).length;
      const afterMatches = (normalizedQuery.match(pattern.mustHaveAfter) || []).length;
      if (patternMatches > 0 && patternMatches !== afterMatches) {
        return { isValid: false, error: pattern.message };
      }
    }
  }

  // Check for malformed string literals
  if (query.includes("''") && !query.includes("''''")) {
    const emptyStringCount = (query.match(/''\s*(?!')(?:[^']|$)/g) || []).length;
    if (emptyStringCount > 0) {
      return { isValid: false, error: "Potential syntax error: Empty string literals" };
    }
  }

  // Check for unclosed comments
  if ((query.match(/\/\*/g) || []).length !== (query.match(/\*\//g) || []).length) {
    return { isValid: false, error: "Unclosed comment block" };
  }

  // Check if the query ends with a semicolon
  if (!query.trim().endsWith(';')) {
    return { isValid: false, error: "SQL query must end with a semicolon (;)" };
  }

  // Detect multiple statements
  const nonCommentedSemicolons = query
    .replace(/'[^']*'/g, '')
    .replace(/"[^"]*"/g, '')
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const semicolonCount = (nonCommentedSemicolons.match(/;/g) || []).length;
  if (semicolonCount > 1) {
    return { isValid: false, error: "Multiple SQL statements are not allowed" };
  }

  // Query passed all validations
  return { isValid: true };
}

/**
 * Validates SQL syntax in real-time as the user types
 * Less strict than validateSqlQuery so it doesn't interrupt typing
 */
export function validateSqlSyntax(query: string): ValidationResult {
  if (!query) return { isValid: true };
  
  // Only check for critical syntax issues during typing
  
  // Unbalanced quotes are a common issue
  const singleQuotes = (query.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    return { isValid: false, error: "Unbalanced single quotes" };
  }
  
  const doubleQuotes = (query.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    return { isValid: false, error: "Unbalanced double quotes" };
  }
  
  // Unbalanced parentheses
  const openParens = (query.match(/\(/g) || []).length;
  const closeParens = (query.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    return { isValid: false, error: "Unbalanced parentheses" };
  }
  
  // Unclosed comment blocks
  if ((query.match(/\/\*/g) || []).length !== (query.match(/\*\//g) || []).length) {
    return { isValid: false, error: "Unclosed comment block" };
  }
  
  return { isValid: true };
}

/**
 * Parses a SQL string and returns an object representing the builder state.
 * Only supports the subset of SQL used in the builder (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, aggregates).
 */
export function parseSqlToBuilderState(sql: string) {
  // Normalize whitespace and remove line breaks for easier regex
  const query = sql.replace(/\s+/g, ' ').trim();
  const builderState: any = {
    table: '',
    columns: [],
    aggregates: [],
    where: [],
    groupBy: [],
    having: [],
    orderBy: [],
    limit: '',
    distinct: false,
  };

  // SELECT clause
  const selectMatch = query.match(/SELECT\s+(DISTINCT\s+)?(.+?)\s+FROM\s+/i);
  if (selectMatch) {
    builderState.distinct = !!selectMatch[1];
    const selectFields = selectMatch[2].split(',').map(f => f.trim());
    for (const field of selectFields) {
      // Aggregate function
      const aggMatch = field.match(/(COUNT|SUM|AVG|MIN|MAX|ARRAY_AGG)\((.*?)\)(?:\s+AS\s+"?([\w_]+)"?)?/i);
      if (aggMatch) {
        builderState.aggregates.push({
          function: aggMatch[1].toUpperCase(),
          column: aggMatch[2].replace(/"/g, ''),
          alias: aggMatch[3] || '',
        });
      } else {
        // Regular column
        builderState.columns.push(field.replace(/"/g, ''));
      }
    }
  }

  // FROM clause
  const fromMatch = query.match(/FROM\s+"?([\w_]+)"?/i);
  if (fromMatch) {
    builderState.table = fromMatch[1];
  }

  // WHERE clause
  const whereMatch = query.match(/WHERE\s+(.+?)(?=(GROUP BY|HAVING|ORDER BY|LIMIT|;|$))/i);
  if (whereMatch) {
    // Split by AND/OR for simplicity
    const conditions = whereMatch[1].split(/\s+AND\s+/i);
    builderState.where = conditions.map(cond => cond.trim());
  }

  // GROUP BY clause
  const groupByMatch = query.match(/GROUP BY\s+(.+?)(?=(HAVING|ORDER BY|LIMIT|;|$))/i);
  if (groupByMatch) {
    builderState.groupBy = groupByMatch[1].split(',').map(f => f.replace(/"/g, '').trim());
  }

  // HAVING clause
  const havingMatch = query.match(/HAVING\s+(.+?)(?=(ORDER BY|LIMIT|;|$))/i);
  if (havingMatch) {
    builderState.having = havingMatch[1].split(/\s+AND\s+/i).map(f => f.trim());
  }

  // ORDER BY clause
  const orderByMatch = query.match(/ORDER BY\s+(.+?)(?=(LIMIT|;|$))/i);
  if (orderByMatch) {
    builderState.orderBy = orderByMatch[1].split(',').map(f => f.replace(/"/g, '').trim());
  }

  // LIMIT clause
  const limitMatch = query.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    builderState.limit = limitMatch[1];
  }

  return builderState;
} 