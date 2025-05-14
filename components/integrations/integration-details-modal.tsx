"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import type { Integration } from "@/lib/types/integration"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, Pencil, Save, X } from "lucide-react"
import { useIntegrations } from "@/lib/hooks/use-integrations"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"

interface IntegrationDetailsModalProps {
  integration: Integration | null
  isOpen: boolean
  onClose: () => void
}

export function IntegrationDetailsModal({ integration, isOpen, onClose }: IntegrationDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedIntegration, setEditedIntegration] = useState<Integration | null>(null)
  const { updateIntegration } = useIntegrations()
  const [isSaving, setIsSaving] = useState(false)
  const { theme } = useTheme()

  // Reset state when modal opens with new integration
  useEffect(() => {
    if (integration && isOpen) {
      setEditedIntegration(JSON.parse(JSON.stringify(integration)))
      setIsEditing(false)
    }
  }, [integration, isOpen])

  if (!integration || !editedIntegration) return null

  const handleInputChange = (field: keyof Integration, value: string | boolean) => {
    setEditedIntegration((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }

  const handleSave = async () => {
    if (!editedIntegration) return

    setIsSaving(true)
    try {
      await updateIntegration(editedIntegration)
      setIsEditing(false)
      toast({
        title: "Integration updated",
        description: "The integration has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update the integration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (integration) {
      setEditedIntegration(JSON.parse(JSON.stringify(integration)))
    }
    setIsEditing(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-[700px]"
    >
      <div
        className="p-6 space-y-6"
        style={{
          background: theme === 'dark' ? '#0C2027' : '#F2F2F2',
          border: '1px solid #506C77',
        }}
      >
        {/* Custom header */}
        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, color: '#EA661B', fontSize: 12 }}>
            Integration detail
          </span>
          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: '#506C77', fontSize: 12 }}>
            / {integration.log_name}
          </span>
        </div>

        {/* Header with Status and Edit/Save buttons */}
        <div className="flex items-center w-full mb-4">
          <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700, color: '#EA661B' }}>Status</span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-7 w-7 !bg-[#0D1315] dark:!bg-[#0D1315] !border-none hover:!bg-[#182325]"
              style={{ boxShadow: 'none' }}
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" style={{ color: '#64828E' }} />
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving} className="ml-2">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="ml-2">
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
          <div className="flex-1 flex justify-end">
            <Badge
              variant="outline"
              className={
                editedIntegration.enabled
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              }
            >
              {editedIntegration.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
                Basic Information
              </h4>

              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <span className="text-muted-foreground">Integration ID:</span>
                <div className="flex w-full justify-end items-center">
                  <span className="font-mono text-xs break-all text-right" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }}>{editedIntegration.integration_id}</span>
                </div>

                <span className="text-muted-foreground">Log Name:</span>
                {isEditing ? (
                  <Input
                    value={editedIntegration.log_name || ""}
                    onChange={(e) => handleInputChange("log_name", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.log_name || ""}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Log Type:</span>
                <div className="flex w-full justify-end items-center">
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.log_type || ""}</span>
                </div>

                <span className="text-muted-foreground">Client:</span>
                {isEditing ? (
                  <Input
                    disabled={true}
                    value={editedIntegration.client || ""}
                    onChange={(e) => handleInputChange("client", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.client || ""}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Auth Profile:</span>
                {isEditing ? (
                  <Input
                    disabled={true}
                    value={editedIntegration.auth_profile || ""}
                    onChange={(e) => handleInputChange("auth_profile", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.auth_profile || ""}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Connection:</span>
                <div className="flex w-full justify-end items-center">
                  <span className="flex items-center">
                    {editedIntegration.enabled ? (
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
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">Authentication</h4>

              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <span className="text-muted-foreground">Auth Type:</span>
                {isEditing ? (
                  <Input
                    value={editedIntegration.auth_type || ""}
                    onChange={(e) => handleInputChange("auth_type", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.auth_type || ""}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Keys Retrieved:</span>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      disabled={true}
                      type="checkbox"
                      checked={!!editedIntegration.keys_retrieved}
                      onChange={(e) => handleInputChange("keys_retrieved", e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <div className="flex w-full justify-end items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.keys_retrieved ? "Yes" : "No"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.keys_retrieved ? "Yes" : "No"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AWS Configuration */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
                AWS Configuration
              </h4>

              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <span className="text-muted-foreground">Region:</span>
                {isEditing ? (
                  <Input
                    value={editedIntegration.region || ""}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.region || "N/A"}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Bucket Name:</span>
                {isEditing ? (
                  <Input
                    value={editedIntegration.bucket_name || ""}
                    onChange={(e) => handleInputChange("bucket_name", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.bucket_name || "N/A"}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Bucket Prefix:</span>
                {isEditing ? (
                  <Input
                    value={editedIntegration.bucket_prefix || ""}
                    onChange={(e) => handleInputChange("bucket_prefix", e.target.value)}
                    className="h-7 text-sm"
                  />
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.bucket_prefix || "N/A"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* GitHub Configuration (if applicable) */}
            {(editedIntegration.github_organization || editedIntegration.github_enterprise || isEditing) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
                  GitHub Configuration
                </h4>

                <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                  <span className="text-muted-foreground">Organization:</span>
                  {isEditing ? (
                    <Input
                      value={editedIntegration.github_organization || ""}
                      onChange={(e) => handleInputChange("github_organization", e.target.value)}
                      className="h-7 text-sm"
                    />
                  ) : (
                    <div className="flex w-full justify-end items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.github_organization || "N/A"}</span>
                    </div>
                  )}

                  <span className="text-muted-foreground">Enterprise:</span>
                  {isEditing ? (
                    <Input
                      value={editedIntegration.github_enterprise || ""}
                      onChange={(e) => handleInputChange("github_enterprise", e.target.value)}
                      className="h-7 text-sm"
                    />
                  ) : (
                    <div className="flex w-full justify-end items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.github_enterprise || "N/A"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
                Additional Information
              </h4>

              <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                <span className="text-muted-foreground">New Integration:</span>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      disabled={true}
                      type="checkbox"
                      checked={!!editedIntegration.new_integration}
                      onChange={(e) => handleInputChange("new_integration", e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <div className="flex w-full justify-end items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.new_integration ? "Yes" : "No"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.new_integration ? "Yes" : "No"}</span>
                  </div>
                )}

                <span className="text-muted-foreground">Enabled:</span>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!editedIntegration.enabled}
                      onChange={(e) => handleInputChange("enabled", e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <div className="flex w-full justify-end items-center">
                      <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.enabled ? "Yes" : "No"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full justify-end items-center">
                    <span style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: theme === 'dark' ? '#FFFFFF' : '#0C2027' }} className="text-right">{editedIntegration.enabled ? "Yes" : "No"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
