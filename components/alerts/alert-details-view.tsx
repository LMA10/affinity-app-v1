"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, X, Download, PlayCircle, Save } from "lucide-react"
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
import { useTheme } from "next-themes"

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const panelBg = isDark ? "#0E1A1F" : "#fff";

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
        return "bg-red-500 text-white border-red-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "high":
        return "bg-orange-500 text-white border-orange-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "medium":
        return "bg-yellow-500 text-white border-yellow-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "low":
        return "bg-green-500 text-white border-green-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      default:
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500 text-white border-blue-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "investigating":
        return "bg-[#00AAE5] text-white border-[#00AAE5] font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "resolved":
        return "bg-green-500 text-white border-green-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      case "false_positive":
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
      default:
        return "bg-gray-500 text-white border-gray-500 font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5"
    }
  }

  return (
    <div
      className="h-full w-full p-2 md:p-6 rounded-none md:rounded-lg max-h-[90vh] md:max-h-full shadow-sm"
      style={{ background: '#0D1315', border: 'none' }}
    >
      <div className="relative mb-2 w-full">
        <div className="flex items-center justify-between pr-0 w-full">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 md:h-6 md:w-6">
              <X className="h-6 w-6 md:h-4 md:w-4" style={{ color: '#EA661B' }} />
            </Button>
            <h3 style={{ 
              color: theme === 'light' ? '#FF7120' : '#EA661B', 
              fontWeight: 700, 
              fontSize: 13,
              fontFamily: 'Helvetica, Arial, sans-serif',
              lineHeight: '13px',
              margin: 0,
              whiteSpace: 'nowrap'
            }}>Alert Details</h3>
          </div>
          <div className="flex items-center gap-2 ml-auto w-full justify-end">
            <Badge
              variant="outline"
              className={
                alert.security_detection?.severity
                  ? getSeverityBadgeColor(alert.security_detection.severity)
                  : "bg-gray-500/20 text-gray-500"
              }
            >
              {(alert.security_detection?.severity || "unknown").toLowerCase()}
            </Badge>
            {status && (
              <Badge variant="outline" className={getStatusBadgeColor(status)}>
                {status}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-1 mt-[18px] w-full">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 !bg-[#0C2027] !border !border-[#506C77] flex items-center justify-center"
            onClick={copyFullAlert}
          >
            <Copy className="h-4 w-4 text-[#506C77]" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 !bg-[#0C2027] !border !border-[#506C77] flex items-center justify-center"
            onClick={exportAlertToJson}
          >
            <Download className="h-4 w-4 text-[#506C77]" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2 w-full">
        {/* Custom tab navigator styled like the logs page */}
        <div className="flex w-full items-center justify-center mb-2" style={{height: '36px'}}>
          <div className="flex w-full h-full">
            <button
              className={`flex-1 flex items-center justify-center px-4 py-2 h-full font-normal font-['Helvetica','Arial',sans-serif] text-white focus:outline-none transition-colors
                ${activeTab === 'formatted' ? 'bg-[#506C77]' : 'bg-[#0C2027]'}
                ${activeTab === 'formatted' ? '' : 'hover:bg-[#1a2e33]'}
                rounded-l-[6px] ${activeTab === 'formatted' ? '' : 'border-r-0'}
              `}
              style={{ borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}
              onClick={() => setActiveTab('formatted')}
              type="button"
            >
              Formatted View
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-4 py-2 h-full font-normal font-['Helvetica','Arial',sans-serif] text-white focus:outline-none transition-colors
                ${activeTab === 'raw' ? 'bg-[#506C77]' : 'bg-[#0C2027]'}
                ${activeTab === 'raw' ? '' : 'hover:bg-[#1a2e33]'}
                rounded-r-[8px] -ml-px
              `}
              style={{ borderTopRightRadius: 6, borderBottomRightRadius: 6 }}
              onClick={() => setActiveTab('raw')}
              type="button"
            >
              Raw JSON
            </button>
          </div>
        </div>
        {/* End custom tab navigator */}

        <TabsContent value="formatted">
          <ScrollArea className="h-[calc(100vh-200px)] pr-1 md:pr-4 w-full hide-scrollbar">
            <div className="grid grid-cols-1 gap-2 w-full pb-4">
              {/* Alert Management */}
              <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-base md:text-xl">Alert Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-3 md:p-6">
                  <div className="grid grid-cols-1 gap-1.5">
                    <div>
                      <Label htmlFor="status" className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status" className="w-full !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77] mt-1">
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
                      <Label htmlFor="owner" className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">
                        Owner
                      </Label>
                      <Select value={owner} onValueChange={setOwner}>
                        <SelectTrigger id="owner" className="w-full !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77] mt-1">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={userEmail}>{userEmail}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="resolved-by" className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">
                        Resolved By
                      </Label>
                      <Select
                        value={resolvedBy}
                        onValueChange={(value) => setResolvedBy(value)}
                      >
                        <SelectTrigger id="resolved-by" className="w-full !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77] mt-1">
                          <SelectValue placeholder="Select resolved by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_resolved">Not Resolved</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="false-positive" className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">
                        False Positive
                      </Label>
                      <Select
                        value={isFalsePositive ? "true" : "false"}
                        onValueChange={(value) => setIsFalsePositive(value === "true")}
                      >
                        <SelectTrigger id="false-positive" className="w-full !bg-[#CAD0D2] dark:!bg-[#0D1315] !text-[#506C77] dark:!text-[#506C77] !border !border-[#506C77] mt-1">
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
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Last Updated</p>
                        <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{formatTimestamp(alert.alert_management.timestamp)}</p>
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
              <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-base md:text-xl">Alert Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 md:p-6">
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Alert Name</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.metadata?.rule_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Alert ID</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77] text-xs break-all">{alert.alert_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Client</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Rule ID</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.rule_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Events Count</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.events}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Time</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{formatTimestamp(alert.event?.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metadata */}
              {alert.metadata && (
                <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Rule Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Rule Name</p>
                        <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.metadata.rule_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Rule Type</p>
                        <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.metadata.rule_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Enabled</p>
                        <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.metadata.enabled ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Custom</p>
                        <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.metadata.custom ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Information */}
              {alert.event && (
                <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Iteration</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.event.iteration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Query</p>
                      <pre className="font-['IBM_Plex_Mono'] text-[#506C77] text-xs bg-muted p-2 rounded-md overflow-x-auto">
                        {alert.event.query}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full bg-[#EA651A] text-white border-none hover:bg-[#d95c17] btn-execute-query"
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
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Time</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{formatTimestamp(alert.event.time)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Detection */}
              {alert.security_detection && (
                <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-base md:text-xl">Security Detection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 md:p-6">
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Severity</p>
                      <Badge variant="outline" className={getSeverityBadgeColor(alert.security_detection.severity)}>
                        {alert.security_detection.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Description</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.security_detection.description}</p>
                    </div>
                    {alert.security_detection.important_data && (
                      <div>
                        <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Important Data</p>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(alert.security_detection.important_data).map(([key, value]) => (
                            <div key={key} className="bg-muted p-2 rounded-md">
                              <p className="text-xs text-white font-['Helvetica','Arial',sans-serif] font-normal">{key}</p>
                              <p className="text-sm font-['IBM_Plex_Mono'] text-[#506C77]">{typeof value === 'string' ? value : JSON.stringify(value) || "-"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white font-['Helvetica','Arial',sans-serif] font-normal">Resolution</p>
                      <p className="font-['IBM_Plex_Mono'] text-[#506C77]">{alert.security_detection.resolution}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* MITRE Techniques */}
              {alert.mitre_techniques && alert.mitre_techniques.length > 0 && (
                <Card className="bg-[#0C2027] border border-[#506C77]" style={{ borderWidth: 1 }}>
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
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 bg-[#506C77] border-2 border-[#506C77] flex items-center justify-center"
              onClick={copyFullAlert}
            >
              <Copy className="h-8 w-8 text-white" />
            </Button>
          </div>
          <div className="relative w-full">
            <ScrollArea className="h-[40vh] md:h-[calc(100vh-180px)] bg-transparent p-2 md:p-4 rounded-md border-0 w-full">
              <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap break-all w-full">
                {JSON.stringify(alert, undefined, prettifyJson ? 2 : undefined)}
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
      <style>{`
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
