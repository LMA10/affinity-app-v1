import type { Integration, IntegrationsResponse } from "../types/integration"
import { getSessionState } from "../state/sessionState/sessionState"
import config from "@/lib/config/configDev"
import sessionState from "@/lib/state/sessionState/sessionState"

const urlapi = config.urlAPI

// Helper to get a cookie value
function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}

export const createHeaders = () => {
  return {
    "Content-Type": "application/json",
    Authorization: sessionState.token || '',
  } as HeadersInit;
};

export const fetchIntegrations = async (): Promise<Integration[]> => {
  try {
    const response = await fetch(`${urlapi}/integrations`, {
      method: "GET",
      headers: createHeaders(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch integrations: ${response.status} ${response.statusText}`)
    }

    const data: IntegrationsResponse = await response.json()

    return data.body.Integrations || []
  } catch (error) {
    //console.error("Error in fetchIntegrations:", error)
    throw error
  }
}

export const toggleIntegrationStatus = async (integrationId: string, enabled: boolean): Promise<Integration> => {
  try {
    const response = await fetch(`${urlapi}/integrations/${integrationId}/toggle`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify({ enabled }),
    })

    if (!response.ok) {
      throw new Error(`Failed to toggle integration status: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.body.integration
  } catch (error) {
    throw error
  }
}

export const updateIntegration = async (integration: Integration): Promise<Integration> => {
  try {
    const response = await fetch(`${urlapi}/integrations/${integration.integration_id}`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(integration),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update integration: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check if the response has the expected structure
    if (data.body && data.body.integration) {
      return data.body.integration
    } else if (data.body && data.body.message && data.body.message.includes("Successfully")) {
      // If the response doesn't have the integration object but indicates success,
      // return the original integration that was sent
      return integration
    } else {
      //console.error("Unexpected response format:", data)
      return integration
    }
  } catch (error) {
    //console.error("Error in updateIntegration:", error)
    throw error
  }
}
