"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Plus, RefreshCw, Settings, Trash2, AlertCircle } from "lucide-react"
import { useIntegrations } from "@/lib/hooks/use-integrations"
import type { Integration } from "@/lib/types/integration"
import { IntegrationDetailsModal } from "@/components/integrations/integration-details-modal"
import { Modal } from "@/components/ui/modal"
import { useIntegrationsStore } from "@/lib/state/integrations/integrationsState"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export default function IntegrationsPage() {
  const { integrations, isLoading, error, fetchIntegrations } = useIntegrations()
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null)
  const { theme } = useTheme()
  const deleteIntegration = useIntegrationsStore((s) => s.deleteIntegration)

  const handleRefresh = () => {
    fetchIntegrations()
  }

  const openIntegrationDetails = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsModalOpen(true)
  }

  const closeIntegrationDetails = () => {
    setIsModalOpen(false)
    setSelectedIntegration(null)
  }

  const handleOpenDeleteModal = (integration: Integration) => {
    setIntegrationToDelete(integration)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!integrationToDelete) return
    try {
      await deleteIntegration(integrationToDelete.integration_id)
      toast({
        title: "Integration deleted",
        description: `${integrationToDelete.log_name || integrationToDelete.integration_id} was deleted successfully.`,
      })
      setDeleteModalOpen(false)
      setIntegrationToDelete(null)
      fetchIntegrations()
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete integration.",
        variant: "destructive",
      })
    }
  }

  // Map log_type to a more user-friendly name and description
  const getIntegrationDetails = (integration: Integration) => {
    const typeMap: Record<string, { name: string; description: string }> = {
      cloudtrail: {
        name: "AWS CloudTrail",
        description: "AWS API activity and usage monitoring",
      },
      guardduty: {
        name: "GuardDuty",
        description: "AWS threat detection service",
      },
      aws_security_hub: {
        name: "AWS Security Hub",
        description: "Centralized security findings from AWS services",
      },
      azure_sentinel: {
        name: "Azure Sentinel",
        description: "Cloud-native solution",
      },
      github: {
        name: "GitHub Security",
        description: "Code scanning and secret detection",
      },
      gcp_security: {
        name: "Google Security Command Center",
        description: "Unified security and risk management for GCP",
      },
    }

    return (
      typeMap[integration.log_type] || {
        name: integration.log_type.charAt(0).toUpperCase() + integration.log_type.slice(1).replace(/_/g, " "),
        description: `${integration.client} integration`,
      }
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme === 'dark' ? '#0E1A1F' : '#E5E5E5' }}>
      <div className="px-12 py-4">
        <div className="flex justify-between items-center">
          <div style={{ 
            color: theme === 'light' ? '#506C77' : '#506C77', 
            fontFamily: 'Helvetica, Arial, sans-serif', 
            fontWeight: 400, 
            fontSize: '12.3px', 
            marginBottom: 0,
            lineHeight: '13px'
          }}>
            <span style={{ color: theme === 'light' ? '#FF7120' : '#EA661B', fontWeight: 700, fontSize: 13 }}>Integrations</span> / manage your security integrations
          </div>
          <div style={{ color: '#0C2027' }}>
            <div style={{ color: '#0C2027' }}>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="bg-[#0f1d24] px-4 py-2 rounded-md">
          <h2 className="text-sm font-medium">Installed ({integrations.length})</h2>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <Card className="bg-[#0f1d24] border-red-600/20">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Error Loading Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button onClick={handleRefresh} className="mt-4 bg-orange-600 hover:bg-orange-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : integrations.length === 0 ? (
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">No Integrations Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You don't have any integrations installed yet.</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration, index) => {
                const details = getIntegrationDetails(integration)
                return (
                  <Card key={index} className="bg-[#0f1d24] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-orange-500">{details.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            integration.enabled
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }
                        >
                          {integration.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{details.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="flex items-center">
                            {integration.enabled ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                Connected
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                                Disabled
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client:</span>
                          <span>{integration.client}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{integration.log_type}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => openIntegrationDetails(integration)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="px-2" onClick={handleRefresh}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="px-2 text-red-500 hover:text-red-600" onClick={() => handleOpenDeleteModal(integration)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <IntegrationDetailsModal
        integration={selectedIntegration}
        isOpen={isModalOpen}
        onClose={closeIntegrationDetails}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setIntegrationToDelete(null); }}
        title="Confirm Delete Integration"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete integration <span className="font-bold">{integrationToDelete?.log_name || integrationToDelete?.integration_id}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setIntegrationToDelete(null); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
