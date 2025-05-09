"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Shield, ArrowRight, ExternalLink, FileText, MessageSquare, CheckCircle } from "lucide-react"


export function AlertDetails({ alert, onClose }: { alert: any; onClose: () => void }) {
  const [status, setStatus] = useState(alert.status)

  // Get the logged-in user's email from localStorage
  let userEmail = ""
  if (typeof window !== "undefined") {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '[]')
      userEmail = currentUser[1] || ""
    } catch {}
  }
  const [owner, setOwner] = useState(alert.owner || userEmail)

  if (!alert) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/20"
      case "high":
        return "bg-orange-500/20 text-orange-500 border-none"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusBadge = (status: string) => {
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

  const handleMarkAsFalsePositive = () => {
    setStatus("false_positive")
    // In a real application, you would call an API to update the alert status
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-orange-500">Alert Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">{alert.title}</h1>
          <Badge variant="outline" className={getSeverityBadge(alert.severity)}>
            {alert.severity.toUpperCase()}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{alert.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Source:</span>
            <span className="ml-2">{alert.source}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="ml-2">{alert.timestamp}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="outline" className={getStatusBadge(status)}>
              {status === "false_positive" ? "False Positive" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">ID:</span>
            <span className="ml-2 font-mono text-xs">{alert.id}</span>
          </div>
        </div>

        {/* Alert Management Section */}
        <div className="mt-4">
          <div className="font-semibold text-orange-500 mb-2">Alert Management</div>
          <div className="mb-2">
            <label className="block text-xs text-muted-foreground mb-1">Owner</label>
            <select
              className="w-full bg-[#0a1419] border rounded-md p-2 text-sm text-orange-500"
              value={owner}
              onChange={e => setOwner(e.target.value)}
            >
              <option value={userEmail}>{userEmail}</option>
            </select>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="enrichment" className="w-full">
          <TabsList className="w-full bg-[#0a1419] flex rounded-md gap-0 p-0 border border-[#506C77]">
            <TabsTrigger value="enrichment" className="flex-1 bg-[#0C2027] border-0 rounded-none font-[400] font-['Helvetica','Arial',sans-serif] text-white data-[state=active]:bg-[#506C77] data-[state=active]:text-white data-[state=active]:font-[400] h-10 px-4 py-2 transition-colors border-r border-[#506C77] last:border-r-0">
              Enrichment
            </TabsTrigger>
            <TabsTrigger value="response" className="flex-1 bg-[#0C2027] border-0 rounded-none font-[400] font-['Helvetica','Arial',sans-serif] text-white data-[state=active]:bg-[#506C77] data-[state=active]:text-white data-[state=active]:font-[400] h-10 px-4 py-2 transition-colors border-r border-[#506C77] last:border-r-0">
              Response
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 bg-[#0C2027] border-0 rounded-none font-[400] font-['Helvetica','Arial',sans-serif] text-white data-[state=active]:bg-[#506C77] data-[state=active]:text-white data-[state=active]:font-[400] h-10 px-4 py-2 transition-colors">
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrichment" className="space-y-4 mt-4">
            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Threat Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Threat Score</span>
                  <span className="font-semibold text-red-500">85/100</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Known Malicious</span>
                  <span className="font-semibold text-green-500">Yes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Associated Campaigns</span>
                  <span className="font-semibold">2</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Intelligence Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Related Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="rounded-md bg-[#0a1419] p-2 border">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">IP Address</div>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        External
                      </Badge>
                    </div>
                    <div className="font-mono text-xs mt-1">203.0.113.42</div>
                    <div className="text-xs text-muted-foreground mt-1">Located in: Russia</div>
                  </div>

                  <div className="rounded-md bg-[#0a1419] p-2 border">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Host</div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Internal
                      </Badge>
                    </div>
                    <div className="font-mono text-xs mt-1">db-server-01</div>
                    <div className="text-xs text-muted-foreground mt-1">Database Server</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="space-y-4 mt-4">
            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm">Isolate affected host</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Execute <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm">Block external IP</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Execute <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm">Capture memory dump</span>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Execute <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Create Incident</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Incident Ticket
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Add Comment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <textarea
                  className="w-full h-20 bg-[#0a1419] border rounded-md p-2 text-sm"
                  placeholder="Add your analysis or notes here..."
                />
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </CardContent>
            </Card>

            {/* New Quick Actions section */}
            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full hover:bg-orange-600/10"
                  onClick={handleMarkAsFalsePositive}
                  disabled={status === "false_positive"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as False Positive
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <Card className="bg-[#0a1419]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative pl-6 pb-4 border-l">
                    <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-orange-500" />
                    <div className="text-xs text-muted-foreground">2025-04-14 08:15:22</div>
                    <div className="text-sm font-medium">Alert Created</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Unusual outbound data transfer detected from database server
                    </div>
                  </div>

                  <div className="relative pl-6 pb-4 border-l">
                    <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-orange-500" />
                    <div className="text-xs text-muted-foreground">2025-04-14 08:16:05</div>
                    <div className="text-sm font-medium">Status Changed</div>
                    <div className="text-xs text-muted-foreground mt-1">Status changed from New to Open</div>
                  </div>

                  <div className="relative pl-6 pb-4 border-l">
                    <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-orange-500" />
                    <div className="text-xs text-muted-foreground">2025-04-14 08:18:30</div>
                    <div className="text-sm font-medium">Enrichment Completed</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Threat intelligence enrichment automatically applied
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-orange-500" />
                    <div className="text-xs text-muted-foreground">2025-04-14 08:20:15</div>
                    <div className="text-sm font-medium">Status Changed</div>
                    <div className="text-xs text-muted-foreground mt-1">Status changed from Open to Investigating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 bg-orange-600 hover:bg-orange-700">Update Status</Button>
        </div>
      </div>
    </div>
  )
}
