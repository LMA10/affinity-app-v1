"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { BarChart, PieChart, AreaChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockAnalyticsData } from "@/lib/mock-data"
import { filterAnalyticsData } from "@/lib/services/data-filter-service"
import { useDateRange } from "@/components/date-range-provider"

// Define explicit colors for charts
const areaChartColors = ["#f97316"]
const pieChartColors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"]
const barChartColors = ["#f97316"]

export default function AnalyticsPage() {
  const { dateRange } = useDateRange()

  // Filter analytics data based on date range
  const filteredData = filterAnalyticsData(mockAnalyticsData, dateRange)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Analytics Dashboard" description="Security analytics across all platforms" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Events</CardDescription>
              <CardTitle className="text-2xl text-orange-500">
                {filteredData.totalEvents?.toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">For {dateRange.label.toLowerCase()}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Security Incidents</CardDescription>
              <CardTitle className="text-2xl text-orange-500">
                {filteredData.securityIncidents?.toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">For {dateRange.label.toLowerCase()}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Monitored Resources</CardDescription>
              <CardTitle className="text-2xl text-orange-500">
                {filteredData.monitoredResources?.toLocaleString() || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Active resources in selected period</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="events">Events Over Time</TabsTrigger>
            <TabsTrigger value="platforms">Platform Distribution</TabsTrigger>
            <TabsTrigger value="incidents">Incident Types</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">Security Events Trend</CardTitle>
                <CardDescription>Daily security events for {dateRange.label.toLowerCase()}</CardDescription>
              </CardHeader>

              <AreaChart
                data={filteredData.eventsOverTime || []}
                index="date"
                categories={["events"]}
                colors={areaChartColors}
                valueFormatter={(value) => `${value.toLocaleString()} events`}
                showLegend={false}
                height="h-[350px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Platform Distribution</CardTitle>
                <CardDescription>Security events by platform for {dateRange.label.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <PieChart
                    data={filteredData.platformDistribution || []}
                    index="name"
                    category="value"
                    colors={pieChartColors}
                    valueFormatter={(value) => `${value.toLocaleString()} events`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Incident Types</CardTitle>
                <CardDescription>
                  Distribution of security incidents for {dateRange.label.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart
                    data={filteredData.incidentTypes || []}
                    index="name"
                    categories={["count"]}
                    colors={barChartColors}
                    valueFormatter={(value) => `${value} incidents`}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-[#0f1d24] border-orange-600/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-orange-500">Top Security Events</CardTitle>
              <CardDescription>Most frequent security events for {dateRange.label.toLowerCase()}</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredData.topEvents || []).map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.type}</TableCell>
                    <TableCell>{event.platform}</TableCell>
                    <TableCell>{event.count.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          event.severity === "critical"
                            ? "bg-red-500/20 text-red-500"
                            : event.severity === "high"
                              ? "bg-orange-500/20 text-orange-500"
                              : event.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {event.severity}
                      </span>
                    </TableCell>
                    <TableCell className={event.trend === "up" ? "text-red-500" : "text-green-500"}>
                      {event.trend === "up" ? "↑" : "↓"} {event.trendValue}%
                    </TableCell>
                  </TableRow>
                ))}

                {(filteredData.topEvents || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No events found for the selected time period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
