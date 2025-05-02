import config from "@/lib/config/configDev"
import sessionState from "@/lib/state/sessionState/sessionState";

const urlapi = config.urlAPI

export interface LogRecord {
  [key: string]: any
}

export interface LogsResponse {
  statusCode: number
  body: {
    message: string
    "Query Execution Status"?: string
    affinity_logs?: {
      records: LogRecord[]
      execution_id: string
      headers: string[]
      next_token: string | null
      records_per_page: number
      total_rows: number
    }
  }
}

export interface DatabasesResponse {
  statusCode: number
  body: {
    message: string
    tables: {
      [key: string]: string[]
    }
  }
}

export async function searchLogs(query: string): Promise<LogsResponse> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${urlapi}/logs/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    // Return the data regardless of status code
    // This allows us to handle error messages in the UI
    return data
  } catch (error) {
    // console.error("Error searching logs:", error)
    // Return a structured error response
    return {
      statusCode: 500,
      body: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

export async function searchLogsNextPage(
  executionId: string,
  nextToken: string | null,
  headers: string[],
): Promise<LogsResponse> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const requestBody: any = {
      execution_id: executionId,
    }

    // Only include next_token if it's not null
    if (nextToken) {
      requestBody.next_token = nextToken
    }

    // Include headers if available
    if (headers && headers.length > 0) {
      requestBody.headers = headers
    }
    const response = await fetch(`${urlapi}/logs/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    // Return the data regardless of status code
    return data
  } catch (error) {
    // Return a structured error response
    return {
      statusCode: 500,
      body: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

export async function getDatabases(): Promise<DatabasesResponse> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${urlapi}/logs/databases`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
    })

    const data = await response.json()

    if (!response.ok) {
      //console.error("Error fetching databases:", data)
      return {
        statusCode: response.status,
        body: {
          message: data.message || `Failed to fetch databases: ${response.status}`,
          tables: {},
        },
      }
    }

    return data
  } catch (error) {
    //console.error("Error fetching databases:", error)
    return {
      statusCode: 500,
      body: {
        message: error instanceof Error ? error.message : "Unknown error",
        tables: {},
      },
    }
  }
}

export default { searchLogs, searchLogsNextPage, getDatabases }
