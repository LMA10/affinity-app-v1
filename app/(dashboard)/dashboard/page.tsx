"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SecurityOverview } from "@/components/dashboard/security-overview"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { ThreatMap } from "@/components/dashboard/threat-map"
import { SystemStatus } from "@/components/dashboard/system-status"
import { PageHeader } from "@/components/page-header"
import { Loading } from "@/components/loading"
import { useDateRange } from "@/components/date-range-provider"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const { dateRange } = useDateRange()

  // Effect to reload data when date range changes
  useEffect(() => {
    // This would typically fetch new data based on the date range
    // For demonstration, we'll just show the loading indicator
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [dateRange])

  const handleTabChange = (value: string) => {
    setLoading(true)
    setActiveTab(value)
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader title="Security Dashboard" description="Real-time security monitoring and analytics" />

      <div className="flex-1 p-6 space-y-6 w-full">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4 w-full">
          <TabsList className="bg-[#0f1d24] dark:bg-[#0f1d24] light:bg-slate-100 tabs-list">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
          </TabsList>

          {loading && <Loading />}

          {/* <TabsContent value="overview" className="space-y-4">
            <SecurityOverview dateRange={dateRange} />
          </TabsContent> */}

          {/* <TabsContent value="alerts" className="space-y-4">
            <RecentAlerts showAll dateRange={dateRange} />
          </TabsContent> */}

          <TabsContent value="threats" className="space-y-4">
            <ThreatMap dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <SystemStatus dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
