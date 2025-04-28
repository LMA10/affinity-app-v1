"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { PieChart, AreaChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockAgentsData } from "@/lib/mock-data"

// Define explicit colors for charts
const pieChartColors = ["#10b981", "#f97316", "#ef4444", "#6b7280"]
const areaChartColors = ["#f97316"]

export default function AgentsAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Agents Analytics" description="Security analytics for deployed agents" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Agents</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAgentsData.totalAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAgentsData.activeAgents} active agents</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Agents with Issues</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAgentsData.agentsWithIssues}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAgentsData.criticalIssues} critical issues</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Outdated Agents</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAgentsData.outdatedAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Need immediate update</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Events Collected</CardDescription>
              <CardTitle className="text-2xl text-orange-500">
                {mockAgentsData.eventsCollected.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Last 24 hours</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="status" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="status">Agent Status</TabsTrigger>
            <TabsTrigger value="events">Event Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Agent Status Distribution</CardTitle>
                <CardDescription>Current status of all deployed agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <PieChart
                    data={mockAgentsData.agentStatusDistribution}
                    index="status"
                    category="count"
                    colors={pieChartColors}
                    valueFormatter={(value) => `${value} agents`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">Event Collection</CardTitle>
                <CardDescription>Events collected by agents over time</CardDescription>
              </CardHeader>

              <AreaChart
                data={mockAgentsData.eventCollection}
                index="date"
                categories={["events"]}
                colors={areaChartColors}
                valueFormatter={(value) => `${value.toLocaleString()} events`}
                showLegend={false}
                height="h-[350px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Card className="bg-[#0f1d24] border-orange-600/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-orange-500">Agent Health</CardTitle>
              <CardDescription>Health status of deployed agents</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent ID</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Check-in</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAgentsData.agentHealth.map((agent, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{agent.id}</TableCell>
                    <TableCell>{agent.hostname}</TableCell>
                    <TableCell>{agent.version}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          agent.status === "healthy"
                            ? "bg-green-500/20 text-green-500"
                            : agent.status === "warning"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : agent.status === "critical"
                                ? "bg-red-500/20 text-red-500"
                                : "bg-gray-500/20 text-gray-500"
                        }`}
                      >
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{agent.lastCheckIn}</TableCell>
                    <TableCell>{agent.issues || "None"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
