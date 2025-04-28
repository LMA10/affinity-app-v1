// Mock data for query results
const mockLogData = [
  {
    timestamp: "2025-04-23T08:15:22.000Z",
    level: "error",
    source: "AWS EC2",
    message: "Failed login attempt detected from unauthorized IP address 192.168.1.254",
    user: "admin",
    ipAddress: "192.168.1.254",
  },
  {
    timestamp: "2025-04-23T08:14:15.000Z",
    level: "warning",
    source: "Firewall",
    message: "Multiple connection attempts blocked from IP 203.0.113.42",
    user: "system",
    ipAddress: "203.0.113.42",
  },
  {
    timestamp: "2025-04-23T08:12:05.000Z",
    level: "info",
    source: "Auth Service",
    message: "User 'jsmith' logged in successfully",
    user: "jsmith",
    ipAddress: "10.0.0.15",
  },
  {
    timestamp: "2025-04-23T08:10:45.000Z",
    level: "error",
    source: "Database",
    message: "Connection timeout after 30s to primary database cluster",
    user: "system",
    ipAddress: "10.0.0.5",
  },
  {
    timestamp: "2025-04-23T08:08:30.000Z",
    level: "warning",
    source: "API Gateway",
    message: "Rate limit exceeded for endpoint /api/users from IP 198.51.100.73",
    user: "api-client",
    ipAddress: "198.51.100.73",
  },
  {
    timestamp: "2025-04-23T08:05:12.000Z",
    level: "info",
    source: "Load Balancer",
    message: "Health check passed for all backend services",
    user: "system",
    ipAddress: "10.0.0.1",
  },
  {
    timestamp: "2025-04-23T08:02:33.000Z",
    level: "debug",
    source: "Auth Service",
    message: "Token refresh requested for user 'asmith'",
    user: "asmith",
    ipAddress: "10.0.0.22",
  },
  {
    timestamp: "2025-04-23T08:00:18.000Z",
    level: "error",
    source: "S3 Bucket",
    message: "Access denied to protected resource s3://company-data/financial/2025-q1.xlsx",
    user: "jdoe",
    ipAddress: "10.0.0.18",
  },
]

// Simple SQL parser to handle basic queries
function parseQuery(query: string) {
  query = query.toLowerCase()

  // Check if it's a SELECT query
  if (!query.includes("select")) {
    throw new Error("Only SELECT queries are supported")
  }

  // Handle WHERE clause
  let filteredData = [...mockLogData]
  if (query.includes("where")) {
    const whereClause = query
      .split("where")[1]
      .split(/order by|group by|limit/)[0]
      .trim()

    // Very basic WHERE parsing - just for demonstration
    if (whereClause.includes("level = 'error'")) {
      filteredData = filteredData.filter((log) => log.level === "error")
    } else if (whereClause.includes("level = 'warning'")) {
      filteredData = filteredData.filter((log) => log.level === "warning")
    } else if (whereClause.includes("level = 'info'")) {
      filteredData = filteredData.filter((log) => log.level === "info")
    }

    // Handle user filter
    if (whereClause.includes("user =")) {
      const userMatch = whereClause.match(/user\s*=\s*'([^']+)'/)
      if (userMatch && userMatch[1]) {
        filteredData = filteredData.filter((log) => log.user === userMatch[1])
      }
    }
  }

  // Handle LIMIT clause
  if (query.includes("limit")) {
    const limitMatch = query.match(/limit\s+(\d+)/i)
    if (limitMatch && limitMatch[1]) {
      const limit = Number.parseInt(limitMatch[1], 10)
      filteredData = filteredData.slice(0, limit)
    }
  }

  return filteredData
}

export async function executeQuery(query: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  try {
    const results = parseQuery(query)

    // Generate mock metrics
    const metrics = {
      queueTime: Math.floor(Math.random() * 100),
      runTime: Math.floor(Math.random() * 1000 + 500),
      dataScanned: `${(Math.random() * 10).toFixed(2)} MB`,
    }

    return { results, metrics }
  } catch (error) {
    throw error
  }
}
