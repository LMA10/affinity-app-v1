"use client"

import { useState } from "react"
import { useSnapshot } from "valtio"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Save, RotateCcw } from "lucide-react"
import adminState from "@/lib/state/admin/adminState"

export default function AdministrationPage() {
  const { pageVisibility } = useSnapshot(adminState)
  const [searchQuery, setSearchQuery] = useState("")

  // Group pages by section
  const sections = {
    Analytics: [
      { path: "/analytics", label: "Analytics Overview" },
      { path: "/analytics/aws", label: "AWS Analytics" },
      { path: "/analytics/github", label: "GitHub Analytics" },
      { path: "/analytics/azure", label: "Azure Analytics" },
      { path: "/analytics/gcp", label: "GCP Analytics" },
      { path: "/analytics/agents", label: "Agents Analytics" },
    ],
    "Cloud Status": [
      { path: "/cloud/aws", label: "AWS Cloud Status" },
      { path: "/cloud/github", label: "GitHub Cloud Status" },
      { path: "/cloud/azure", label: "Azure Cloud Status" },
      { path: "/cloud/gcp", label: "GCP Cloud Status" },
    ],
    Management: [
      { path: "/management/users", label: "User Management" },
      { path: "/management/integrations", label: "Integrations Management" },
      { path: "/management/notifications", label: "Notifications Management" },
      { path: "/management/agents", label: "Agents Management" },
    ],
    "Individual Pages": [
      { path: "/logs", label: "Logs" },
      { path: "/alerts", label: "Alerts" },
      { path: "/wiki", label: "Wiki" },
      { path: "/legal", label: "Legal" },
    ],
  }

  // Filter pages based on search query
  const filterPages = (pages: { path: string; label: string }[]) => {
    if (!searchQuery) return pages
    return pages.filter(
      (page) =>
        page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.path.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  // Reset all visibility settings to default (all visible)
  const resetAllVisibility = () => {
    Object.keys(pageVisibility).forEach((page) => {
      adminState.setPageVisibility(page, true)
    })
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Administration" description="Manage application settings and page visibility" />

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="page-visibility" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="page-visibility">Page Visibility</TabsTrigger>
            <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="page-visibility" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-orange-500">Page Visibility Settings</CardTitle>
                    <CardDescription>Control which pages and sections are visible in the sidebar</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetAllVisibility} className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-8">
                  {Object.entries(sections).map(([sectionName, pages]) => {
                    const filteredPages = filterPages(pages)
                    if (filteredPages.length === 0) return null

                    return (
                      <div key={sectionName} className="space-y-4">
                        <h3 className="text-lg font-medium text-orange-500">{sectionName}</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {filteredPages.map((page) => (
                            <div
                              key={page.path}
                              className="flex items-center justify-between p-4 rounded-md bg-[#0a1419] border border-orange-600/10"
                            >
                              <div>
                                <p className="font-medium">{page.label}</p>
                                <p className="text-xs text-muted-foreground">{page.path}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`visibility-${page.path}`}
                                  checked={pageVisibility[page.path] ?? true}
                                  onCheckedChange={(checked) => adminState.setPageVisibility(page.path, checked)}
                                />
                                <Label htmlFor={`visibility-${page.path}`} className="sr-only">
                                  {page.label} visibility
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system-settings" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">System Settings</CardTitle>
                <CardDescription>Configure global system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-analytics">Enable Analytics Tracking</Label>
                      <Switch id="enable-analytics" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymous usage data to improve the application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-notifications">Enable System Notifications</Label>
                      <Switch id="enable-notifications" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">Show notifications for system events and alerts</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-auto-refresh">Enable Auto-Refresh</Label>
                      <Switch id="enable-auto-refresh" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh data on dashboard and analytics pages
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Auto-Refresh Interval (seconds)</Label>
                    <Input id="refresh-interval" type="number" defaultValue="60" min="10" max="3600" />
                  </div>

                  <div className="pt-4">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
