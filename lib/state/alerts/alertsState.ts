import { create } from "zustand"
import alertService, { type Alert, type AlertsResponse, type AlertManagementUpdate } from "@/lib/services/alertService"
import listViewStore from "@/lib/state/list/listView"
import sessionState from "@/lib/state/sessionState/sessionState"
import { getToken } from "@/lib/utils/auth"

interface AlertsState {
  alerts: Alert[]
  loading: boolean
  error: string | null
  fetchAlerts: () => Promise<void>
  updateAlertManagement: (alertId: string, alertManagement: AlertManagementUpdate) => Promise<void>
}

const useAlertsState = create<AlertsState>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,
  fetchAlerts: async () => {
    set({ loading: true, error: null })
    try {
      const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
      if (!token) {
        throw new Error("No authorization token found")
      }
      const response: AlertsResponse = await alertService.fetchAlerts(token)

      if (response.statusCode === 200 && response.body && response.body.alerts) {
        const alerts = response.body.alerts

        set({ alerts: alerts, loading: false })

        // Define column order and labels
        const columnOrder = ["client", "alert_id", "metadata", "event", "security_detection", "mitre_techniques"]

        // Create columns based on the defined order
        const columns = columnOrder
          .filter((key) => alerts.some((alert) => (alert as any)[key] !== undefined))
          .map((key) => ({
            key,
            label: key.toUpperCase().replace(/_/g, " "),
          }))

        listViewStore.setListData(alerts)
        listViewStore.setVisibleColumns(columns)
      } else {
        throw new Error("Invalid response format from alerts service")
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : "Failed to fetch alerts"
      set({ error: error, loading: false })
    }
  },
  updateAlertManagement: async (alertId: string, alertManagement: AlertManagementUpdate) => {
    set({ loading: true, error: null })
    try {
      const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
      if (!token) {
        throw new Error("No authorization token found")
      }

      await alertService.updateAlertManagement(token, alertId, alertManagement)

      // Update the alert in the local state
      const alerts = get().alerts
      const updatedAlerts = alerts.map((alert) => {
        if (alert.alert_id === alertId) {
          return {
            ...alert,
            alert_management: {
              ...alert.alert_management,
              ...alertManagement,
            },
          }
        }
        return alert
      })

      set({ alerts: updatedAlerts, loading: false })

      // Update the list view store
      listViewStore.setListData(updatedAlerts)
    } catch (e) {
      const error = e instanceof Error ? e.message : "Failed to update alert"
      set({ error: error, loading: false })
    }
  },
}))

export default useAlertsState
