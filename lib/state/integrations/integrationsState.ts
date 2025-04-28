import { create } from "zustand"
import type { Integration } from "../../types/integration"
import {
  fetchIntegrations,
  toggleIntegrationStatus,
  updateIntegration as updateIntegrationService,
} from "../../services/integrationService"

interface IntegrationsState {
  integrations: Integration[]
  isLoading: boolean
  error: string | null
  fetchIntegrations: () => Promise<void>
  toggleIntegrationStatus: (integrationId: string, enabled: boolean) => Promise<void>
  updateIntegration: (integration: Integration) => Promise<Integration>
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  integrations: [],
  isLoading: false,
  error: null,

  fetchIntegrations: async () => {
    set({ isLoading: true, error: null })
    try {
      const integrations = await fetchIntegrations()
      set({ integrations, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch integrations", isLoading: false })
    }
  },

  toggleIntegrationStatus: async (integrationId: string, enabled: boolean) => {
    set({ isLoading: true, error: null })
    try {
      const updatedIntegration = await toggleIntegrationStatus(integrationId, enabled)
      set((state) => ({
        integrations: state.integrations.map((integration) =>
          integration.integration_id === integrationId ? updatedIntegration : integration,
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to toggle integration status", isLoading: false })
    }
  },

  updateIntegration: async (integration: Integration) => {
    set({ isLoading: true, error: null })
    try {
      const updatedIntegration = await updateIntegrationService(integration)

      set((state) => ({
        integrations: state.integrations.map((item) =>
          item.integration_id === integration.integration_id ? updatedIntegration : item,
        ),
        isLoading: false,
      }))

      return updatedIntegration
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update integration",
        isLoading: false,
      })
      throw error // Re-throw to handle in the component
    }
  },
}))
