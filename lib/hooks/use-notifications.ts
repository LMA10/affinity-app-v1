"use client"

import { useEffect } from "react"
import { useNotificationState } from "@/lib/state/notificationState/notificationState"

export function useNotifications() {
  const notificationState = useNotificationState()

  useEffect(() => {
    // Fetch channels on first mount
    if (notificationState.channels.length === 0 && !notificationState.isLoading) {
      notificationState.fetchChannels().catch((error) => {
      })
    }
  }, [notificationState])

  return notificationState
}
