"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, X, FileDown, PlayCircle, Save } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { storeQuery } from "@/lib/utils/query-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useAlertsState from "@/lib/state/alerts/alertsState"
import sessionState from "@/lib/state/sessionState/sessionState"
import type { AlertManagementUpdate } from "@/lib/services/alertService"

interface AlertDetailsViewProps {
  alert: any
  onClose: () => void
  onValueClick?: (field: string, value: string) => void
}

export function AlertDetailsView({ alert, onClose, onValueClick }: AlertDetailsViewProps) {
  const [activeTab, setActiveTab] = useState("formatted")
  const [prettifyJson, setPrettifyJson] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const updateAlertManagement = useAlertsState((state) => state.updateAlertManagement)

  // Alert management state
  const [status, setStatus] = useState<string>(alert.alert_management?.status || "")
  // Get the logged-in user's email from localStorage
  let userEmail = ""
  if (typeof window !== "undefined") {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '[]')
      userEmail = currentUser[1] || ""
    } catch {}
  }
  const [owner, setOwner] = useState<string>(alert.alert_management?.owner || userEmail)
  const [resolvedBy, setResolvedBy] = useState<string>(alert.alert_management?.resolved_by || "not_resolved")
  const [isFalsePositive, setIsFalsePositive] = useState<boolean>(alert.alert_management?.is_false_positive || false)

  // Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false)

  // Update hasChanges when any field changes
  useEffect(() => {
    const originalStatus = alert.alert_management?.status || ""
    const originalOwner = alert.alert_management?.owner || ""
    const originalResolvedBy = alert.alert_management?.resolved_by || ""
    const originalIsFalsePositive = alert.alert_management?.is_false_positive || false

    const changed =
      status !== originalStatus ||
      owner !== originalOwner ||
      resolvedBy !== originalResolvedBy ||
      isFalsePositive !== originalIsFalsePositive

    setHasChanges(changed)
  }, [status, owner, resolvedBy, isFalsePositive, alert])

  // Reset copied field after a delay
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => {
        setCopiedField(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedField])

  const handleValueClick = (field: string, value: string) => {
    if (onValueClick) {
      onValueClick(field, value)
    }
  }

  const copyToClipboard = (field: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      title: "Copied to clipboard",
      description: `${field}: ${text.substring(0, 30)}${text.length > 30 ? "..." : ""}`,
      duration: 2000,
    })
  }

  const copyFullAlert = () => {
    navigator.clipboard.writeText(JSON.stringify(alert, undefined, prettifyJson ? 2 : undefined))
    toast({
      title: "Copied to clipboard",
      description: "The full alert has been copied to your clipboard",
      duration: 2000,
    })
  }

  const exportAlertToJson = () => {
    const jsonContent = JSON.stringify(alert, undefined, prettifyJson ? 2 : undefined)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `alert_${alert.alert_id || new Date().toISOString()}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Alert exported to JSON",
      duration: 2000,
    })
  }

  const saveAlertManagement = async () => {
    setIsSaving(true)
    try {
      const updateData: AlertManagementUpdate = {
        status,
        owner,
        resolved_by: resolvedBy,
        is_false_positive: isFalsePositive,
        timestamp: new Date().toISOString(),
      }

      await updateAlertManagement(alert.alert_id, updateData)

      toast({
        title: "Alert updated",
        description: "Alert management information has been updated successfully",
        duration: 3000,
      })

      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update alert management",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "-"
    try {
      return new Date(timestamp).toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  // Get severity badge color
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/20"
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20"
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20"
      case "investigating":
        return "bg-purple-500/20 text-purple-500 border-purple-500/20"
      case "resolved":
        return "bg-green-500/20 text-green-500 border-green-500/20"
      case "false_positive":
        return "bg-gray-500/20 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="bg-[#0a1419] h-full w-full p-2 md:p-6 rounded-none md:rounded-lg overflow-y-auto max-h-[90vh] md:max-h-full overflow-x-auto">
      <div className="relative mb-4 w-full">
        <div className="flex items-center gap-2 pr-10 w-full">
          <h3 className="text-orange-500 font-medium text-lg md:text-xl">Alert Details</h3>
          <Badge
            variant="outline"
            className={
              alert.security_detection?.severity
                ? getSeverityBadgeColor(alert.security_detection.severity)
                : "bg-gray-500/20 text-gray-500"
            }
          >
            {alert.security_detection?.severity || "Unknown"} Severity
          </Badge>
          {status && (
            <Badge variant="outline" className={getStatusBadgeColor(status)}>
              {status}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 h-10 w-10 md:h-6 md:w-6">
          <X className="h-6 w-6 md:h-4 md:w-4" />
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
          <Button variant="outline" size="sm" onClick={copyFullAlert} className="h-10 px-2 w-full sm:w-auto">
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={exportAlertToJson} className="h-10 px-2 w-full sm:w-auto">
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 w-full">
        <TabsList className="bg-[#0f1d24] flex flex-wrap w-full">
          <TabsTrigger value="formatted">Formatted View</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="formatted">
          <ScrollArea className="h-[60vh] md:h-[calc(100vh-120px)] pr-1 md:pr-4 w-full">
            <div className="grid grid-cols-1 gap-4 w-full">
              {/* Alert Management */}
              <Card className="bg-[#0f1d24] border border-orange-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-base md:text-xl">Alert Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-3 md:p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="status" className="text-sm text-muted-foreground">
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="false_positive">False Positive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="owner" className="text-sm text-muted-foreground">
                        Owner
                      </Label>
                      <Select value={owner} onValueChange={setOwner}>
                        <SelectTrigger id="owner" className="mt-1">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={userEmail}>{userEmail}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="resolved-by" className="text-sm text-muted-foreground">
                        Resolved By
                      </Label>
                      <Select
                        value={resolvedBy}
                        onValueChange={(value) => setResolvedBy(value)}
                      >
                        <SelectTrigger id="resolved-by" className="mt-1">
                          <SelectValue placeholder="Select resolved by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_resolved">Not Resolved</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="false-positive" className="text-sm text-muted-foreground">
                        False Positive
                      </Label>
                      <Select
                        value={isFalsePositive ? "true" : "false"}
                        onValueChange={(value) => setIsFalsePositive(value === "true")}
                      >
                        <SelectTrigger id="false-positive" className="mt-1">
                          <SelectValue placeholder="Select false positive status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {alert.alert_management?.timestamp && (
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p>{formatTimestamp(alert.alert_management.timestamp)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={saveAlertManagement}
                    disabled={!hasChanges || isSaving}
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Alert Overview */}
              <Card className="bg-[#0f1d24] border border-orange-600/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-base md:text-xl">Alert Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 md:p-6">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Alert Name</p>
                      <p className="font-medium">{alert.metadata?.rule_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Alert ID</p>
                      <p className="font-mono text-xs break-all">{alert.alert_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p>{alert.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rule ID</p>
                      <p>{alert.rule_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Events Count</p>
                      <p>{alert.events}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p>{formatTimestamp(alert.event?.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              {alert.metadata && (
                <Card className="bg-[#0f1d24] border border-orange-600/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Rule Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Rule Name</p>
                        <p>{alert.metadata.rule_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rule Type</p>
                        <p>{alert.metadata.rule_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enabled</p>
                        <p>{alert.metadata.enabled ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Custom</p>
                        <p>{alert.metadata.custom ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Information */}
              {alert.event && (
                <Card className="bg-[#0f1d24] border border-orange-600/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Iteration</p>
                      <p>{alert.event.iteration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Query</p>
                      <pre className="font-mono text-xs bg-[#0a1014] p-2 rounded-md overflow-x-auto">
                        {alert.event.query}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border-orange-600/20"
                        onClick={() => {
                          // Copy query to clipboard
                          navigator.clipboard.writeText(alert.event.query)

                          // Store query for the logs page
                          storeQuery(alert.event.query)

                          // Show toast notification
                          toast({
                            title: "Query copied",
                            description: "Redirecting to logs page...",
                            duration: 2000,
                          })

                          // Redirect to logs page
                          router.push("/logs")
                        }}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Execute Query
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p>{formatTimestamp(alert.event.time)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Detection */}
              {alert.security_detection && (
                <Card className="bg-[#0f1d24] border border-orange-600/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Security Detection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <Badge variant="outline" className={getSeverityBadgeColor(alert.security_detection.severity)}>
                        {alert.security_detection.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p>{alert.security_detection.description}</p>
                    </div>
                    {alert.security_detection.important_data && (
                      <div>
                        <p className="text-sm text-muted-foreground">Important Data</p>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(alert.security_detection.important_data).map(([key, value]) => (
                            <div key={key} className="bg-[#0a1014] p-2 rounded-md">
                              <p className="text-xs text-muted-foreground">{key}</p>
                              <p className="text-sm">{typeof value === 'string' ? value : JSON.stringify(value) || "-"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Resolution</p>
                      <p>{alert.security_detection.resolution}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* MITRE Techniques */}
              {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                <Card className="bg-[#0f1d24] border border-orange-600/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">MITRE ATT&CK Techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {alert.mitre_techniques.map((technique: string) => (
                        <Badge key={technique} variant="outline" className="bg-blue-500/10 text-blue-500">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="raw">
          <div className="flex justify-between items-center mb-4 w-full">
            <div className="flex items-center space-x-2">
              <Switch id="prettify-json" checked={prettifyJson} onCheckedChange={setPrettifyJson} />
              <Label htmlFor="prettify-json">Prettify JSON</Label>
            </div>
            <Button variant="outline" size="sm" className="h-10 px-2" onClick={copyFullAlert}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <div className="relative w-full">
            <ScrollArea className="h-[40vh] md:h-[calc(100vh-180px)] bg-[#0f1d24] p-2 md:p-4 rounded-md border border-orange-600/10 w-full">
              <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap break-all w-full">
                {JSON.stringify(alert, undefined, prettifyJson ? 2 : undefined)}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
