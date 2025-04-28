"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { AreaChart, BarChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockAzureData } from "@/lib/mock-data"

// Define explicit colors for charts
const pieChartColors = ["#0078D4", "#50E6FF", "#D83B01", "#B2B2B2"]
const areaChartColors = ["#0078D4"]
const barChartColors = ["#0078D4"]

export default function AzureAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Azure Analytics" description="Security analytics for Azure resources" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Virtual Machines</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAzureData.virtualMachines}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAzureData.vmWithIssues} with issues</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Storage Accounts</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAzureData.storageAccounts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAzureData.publicStorageAccounts} public accounts</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Network Security Groups</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAzureData.networkSecurityGroups}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAzureData.nsgWithIssues} with issues</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Key Vaults</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAzureData.keyVaults}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAzureData.keyVaultsWithIssues} with issues</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="security">Security Scores</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Security Scores by Category</CardTitle>
                <CardDescription>Security posture across Azure services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart
                    data={mockAzureData.securityScores}
                    index="category"
                    categories={["score"]}
                    colors={barChartColors}
                    valueFormatter={(value) => `${value}%`}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">Activity Logs</CardTitle>
                <CardDescription>Azure activity events over time</CardDescription>
              </CardHeader>

              <AreaChart
                data={mockAzureData.activityLogs}
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
              <CardTitle className="text-orange-500">Security Recommendations</CardTitle>
              <CardDescription>Recommended actions to improve security posture</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAzureData.securityRecommendations.map((recommendation, index) => (
                  <TableRow key={index}>
                    <TableCell>{recommendation.recommendation}</TableCell>
                    <TableCell>{recommendation.resource}</TableCell>
                    <TableCell>{recommendation.resourceType}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          recommendation.severity === "high"
                            ? "bg-red-500/20 text-red-500"
                            : recommendation.severity === "medium"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-blue-500/20 text-blue-500"
                        }`}
                      >
                        {recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          recommendation.status === "open"
                            ? "bg-red-500/20 text-red-500"
                            : recommendation.status === "in_progress"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {recommendation.status === "in_progress"
                          ? "In Progress"
                          : recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
                      </span>
                    </TableCell>
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
