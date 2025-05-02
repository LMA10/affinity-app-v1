import { NEXT_PUBLIC_API_URL } from "@/lib/config/configDev"
import sessionState from "@/lib/state/sessionState/sessionState";

export interface NotificationChannel {
  notification_id?: string
  name: string
  notification_type: string
  channel: string
  webhook_url: string
  client: string
  enabled: boolean
}

interface NotificationResponse {
  statusCode: number
  body: {
    message: string
    notifications: NotificationChannel[]
  }
}

interface AddNotificationResponse {
  statusCode: number
  body: {
    message: string
    notification?: NotificationChannel
  }
}

export async function addNotificationChannel(channelData: NotificationChannel): Promise<NotificationChannel> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify(channelData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Failed to add notification channel: ${response.status}`)
    }

    const data: AddNotificationResponse = await response.json()

    // If the API doesn't return the created notification, return the input data with a generated ID
    if (!data.body.notification) {
      return {
        ...channelData,
        notification_id: `temp-${Date.now()}`,
      }
    }

    return data.body.notification
  } catch (error) {
    throw error
  }
}

export async function getNotificationChannels(): Promise<NotificationChannel[]> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Failed to fetch notification channels: ${response.status}`)
    }

    const data: NotificationResponse = await response.json()

    // Ensure we have an array of notifications, even if empty
    return data.body.notifications || []
  } catch (error) {
    //console.error("Error fetching notification channels:", error)
    throw error
  }
}

export async function updateNotificationChannel(
  id: string,
  channelData: NotificationChannel,
): Promise<NotificationChannel> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify(channelData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Failed to update notification channel: ${response.status}`)
    }

    const data: NotificationResponse = await response.json()

    // If the API doesn't return the updated notification, return the input data
    if (!data.body.notifications || data.body.notifications.length === 0) {
      return {
        ...channelData,
        notification_id: id,
      }
    }

    return data.body.notifications[0]
  } catch (error) {
    //console.error(`Error updating notification channel with ID ${id}:`, error)
    throw error
  }
}

export async function deleteNotificationChannel(id: string): Promise<void> {
  try {
    const token = sessionState.token || '';
    if (!token) {
      throw new Error("No authorization token found")
    }

    const response = await fetch(`${NEXT_PUBLIC_API_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.message || `Failed to delete notification channel: ${response.status}`)
    }
  } catch (error) {
    //console.error(`Error deleting notification channel with ID ${id}:`, error)
    throw error
  }
}
