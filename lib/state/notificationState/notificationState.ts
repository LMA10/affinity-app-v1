import { create } from "zustand"
import {
  getNotificationChannels,
  addNotificationChannel,
  updateNotificationChannel,
  deleteNotificationChannel,
  type NotificationChannel,
} from "@/lib/services/notificationService"

interface NotificationState {
  channels: NotificationChannel[]
  isLoading: boolean
  error: string | null
  fetchChannels: () => Promise<void>
  addChannel: (channelData: NotificationChannel) => Promise<NotificationChannel>
  updateChannel: (id: string, channelData: NotificationChannel) => Promise<NotificationChannel>
  deleteChannel: (id: string) => Promise<void>
}

export const useNotificationState = create<NotificationState>((set, get) => ({
  channels: [],
  isLoading: false,
  error: null,

  fetchChannels: async () => {
    set({ isLoading: true, error: null })
    try {
      const channels = await getNotificationChannels()
      set({ channels, isLoading: false })
      return channels
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch channels"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  addChannel: async (channelData: NotificationChannel) => {
    set({ isLoading: true, error: null })
    try {
      const newChannel = await addNotificationChannel(channelData)
      set((state) => ({
        channels: [...state.channels, newChannel],
        isLoading: false,
      }))
      return newChannel
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add channel"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateChannel: async (id: string, channelData: NotificationChannel) => {
    set({ isLoading: true, error: null })
    try {
      const updatedChannel = await updateNotificationChannel(id, channelData)
      set((state) => ({
        channels: state.channels.map((channel) => (channel.notification_id === id ? updatedChannel : channel)),
        isLoading: false,
      }))
      return updatedChannel
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update channel"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteChannel: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteNotificationChannel(id)
      set((state) => ({
        channels: state.channels.filter((channel) => channel.notification_id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete channel"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
}))

export default useNotificationState
