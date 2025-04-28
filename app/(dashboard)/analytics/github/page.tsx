"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { BarChart, LineChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockGithubData } from "@/lib/mock-data"

// Define explicit colors for charts
const lineChartColors = ["#f97316"]
const barChartColors = ["#f97316", "#3b82f6"]

export default function GithubAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="GitHub Analytics" description="Security analytics for GitHub repositories" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Repositories</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGithubData.repositories}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockGithubData.publicRepos} public repositories</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Vulnerabilities</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGithubData.vulnerabilities}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {mockGithubData.criticalVulnerabilities} critical vulnerabilities
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Secret Scans</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGithubData.secretScans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockGithubData.secretsFound} secrets found</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Code Scans</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGithubData.codeScans}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockGithubData.codeIssues} issues found</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vulnerabilities" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="activity">Repository Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="vulnerabilities" className="space-y-4">
            <div className="space-y-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">Vulnerabilities Over Time</CardTitle>
                <CardDescription>Detected vulnerabilities in GitHub repositories</CardDescription>
              </CardHeader>

              <LineChart
                data={mockGithubData.vulnerabilitiesOverTime}
                index="date"
                categories={["count"]}
                colors={lineChartColors}
                valueFormatter={(value) => `${value.toLocaleString()} vulnerabilities`}
                showLegend={false}
                height="h-[350px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Repository Activity</CardTitle>
                <CardDescription>Commits and pull requests across repositories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart
                    data={mockGithubData.repositoryActivity}
                    index="repository"
                    categories={["commits", "pullRequests"]}
                    colors={barChartColors}
                    valueFormatter={(value) => `${value}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-[#0f1d24] border-orange-600/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-orange-500">Recent Security Alerts</CardTitle>
              <CardDescription>Security alerts from GitHub repositories</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGithubData.securityAlerts.map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{alert.repository}</TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{alert.package}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          alert.severity === "critical"
                            ? "bg-red-500/20 text-red-500"
                            : alert.severity === "high"
                              ? "bg-orange-500/20 text-orange-500"
                              : alert.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          alert.status === "open"
                            ? "bg-red-500/20 text-red-500"
                            : alert.status === "in_progress"
                              ? "bg-orange-500/20 text-orange-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {alert.status === "in_progress"
                          ? "In Progress"
                          : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
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
