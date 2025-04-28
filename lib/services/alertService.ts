import config from "@/lib/config/configDev"

const urlapi = config.urlAPI

export interface Alert {
  client: string
  alert_id: string
  metadata?: {
    rule_name: string
    rule_type: string
    enabled: boolean
    custom: boolean
  }
  event?: {
    iteration: string
    query: string
    time: string
  }
  alert_management?: {
    is_false_positive: boolean
    owner: string | null
    resolved_by: string | null
    status: string
    timestamp: string
  }
  security_detection?: {
    severity: string
    description: string
    important_data: {
      [key: string]: string
    }
    resolution: string
  }
  mitre_techniques?: string[]
}

export interface AlertsResponse {
  statusCode: number
  body: {
    message: string
    alerts: Alert[]
  }
}

export interface AlertUpdateResponse {
  statusCode: number
  body: {
    message: string
    alert_id: string
  }
}

export interface AlertManagementUpdate {
  is_false_positive: boolean
  owner: string | null
  resolved_by: string | null
  status: string
  timestamp?: string
}

const fetchAlerts = async (token: string): Promise<AlertsResponse> => {
  try {
    if (!token) {
      throw new Error("No authorization token found")
    }
    const response = await fetch(`${urlapi}/alerts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })

    const responseData = await response.json()

    // Handle the new response format
    if (responseData.statusCode === 200) {
      return responseData
    } else {
      // Handle error responses
      let errorMessage = "An error occurred while fetching alerts"

      // Parse the error body if it exists
      if (responseData.body) {
        try {
          const errorData = typeof responseData.body === "string" ? JSON.parse(responseData.body) : responseData.body

          if (errorData.error) {
            errorMessage = errorData.error.message

            // Include additional error details if available
            if (errorData.error.details) {
              if (errorData.error.details.errors && errorData.error.details.errors.length > 0) {
                // For validation errors with multiple issues
                errorMessage = errorData.error.details.errors.map((err: { msg: string }) => err.msg).join(", ")
              } else if (errorData.error.details.error_type) {
                // For other error types
                errorMessage += ` (${errorData.error.details.error_type})`
              }
            }
          }
        } catch (parseError) {
          //console.error("Error parsing error response:", parseError)
        }
      }

      throw new Error(errorMessage)
    }
  } catch (error) {
    //console.error("Error fetching alerts:", error)
    throw error
  }
}

const updateAlertManagement = async (
  token: string,
  alertId: string,
  alertManagement: AlertManagementUpdate,
): Promise<AlertUpdateResponse> => {
  try {
    if (!token) {
      throw new Error("No authorization token found")
    }

    // Add timestamp if not provided
    if (!alertManagement.timestamp) {
      alertManagement.timestamp = new Date().toISOString()
    }

    const response = await fetch(`${urlapi}/alerts/${alertId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        alert_management: alertManagement,
      }),
    })

    const responseData = await response.json()

    if (responseData.statusCode === 201 || responseData.statusCode === 200) {
      return responseData
    } else {
      // Handle error responses
      let errorMessage = "An error occurred while updating the alert"

      // Parse the error body if it exists
      if (responseData.body) {
        try {
          const errorData = typeof responseData.body === "string" ? JSON.parse(responseData.body) : responseData.body

          if (errorData.error) {
            errorMessage = errorData.error.message

            // Include additional error details if available
            if (errorData.error.details) {
              if (errorData.error.details.errors && errorData.error.details.errors.length > 0) {
                // For validation errors with multiple issues
                errorMessage = errorData.error.details.errors.map((err: { msg: string }) => err.msg).join(", ")
              } else if (errorData.error.details.error_type) {
                // For other error types
                errorMessage += ` (${errorData.error.details.error_type})`
              }
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
      }

      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error("Error updating alert:", error)
    throw error
  }
}

const alertService = { fetchAlerts, updateAlertManagement }

export default alertService
