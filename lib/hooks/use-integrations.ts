"use client"

import { useEffect } from "react"
import { useIntegrationsStore } from "../state/integrations/integrationsState"

export const useIntegrations = () => {
  const { integrations, isLoading, error, fetchIntegrations, toggleIntegrationStatus, updateIntegration } =
    useIntegrationsStore()

  useEffect(() => {
    fetchIntegrations()
  }, [fetchIntegrations])

  return {
    integrations,
    isLoading,
    error,
    fetchIntegrations,
    toggleIntegrationStatus,
    updateIntegration,
  }
}
