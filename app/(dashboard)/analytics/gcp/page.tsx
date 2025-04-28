"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { BarChart, AreaChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockGcpData } from "@/lib/mock-data"

export default function GcpAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="GCP Analytics" description="Security analytics for Google Cloud Platform" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Compute Instances</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGcpData.computeInstances}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockGcpData.computeWithIssues} with security issues</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Storage Buckets</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGcpData.storageBuckets}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockGcpData.publicBuckets} publicly accessible</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Firewall Rules</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGcpData.firewallRules}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {mockGcpData.riskyFirewallRules} with risky configurations
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>IAM Roles</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockGcpData.iamRoles}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {mockGcpData.overPrivilegedRoles} over-privileged roles
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="securityHealth" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="securityHealth">Security Health</TabsTrigger>
            <TabsTrigger value="auditLogs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="securityHealth" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Security Health by Service</CardTitle>
                <CardDescription>Security Command Center findings by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart
                    data={mockGcpData.securityHealthByService}
                    index="service"
                    categories={["findings"]}
                    colors={["#f97316"]}
                    valueFormatter={(value) => `${value} findings`}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditLogs" className="space-y-4">
            <Card className="space-y-4 bg-[#0f1d24] border-orange-600/20 p-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">Audit Logs</CardTitle>
                <CardDescription>Security-related audit logs over time</CardDescription>
              </CardHeader>

              <AreaChart
                data={mockGcpData.auditLogs}
                index="date"
                categories={["events"]}
                colors={["#f97316"]}
                valueFormatter={(value) => `${value.toLocaleString()} events`}
                showLegend={false}
                height="h-[350px]"
              />
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-[#0f1d24] border-orange-600/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-orange-500">Security Findings</CardTitle>
              <CardDescription>Findings from Security Command Center</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Finding</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGcpData.securityFindings.map((finding, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{finding.finding}</TableCell>
                    <TableCell>{finding.resource}</TableCell>
                    <TableCell>{finding.category}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          finding.severity === "critical"
                            ? "bg-red-500/20 text-red-500"
                            : finding.severity === "high"
                              ? "bg-orange-500/20 text-orange-500"
                              : finding.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          finding.status === "active"
                            ? "bg-red-500/20 text-red-500"
                            : finding.status === "in_progress"
                              ? "bg-orange-500/20 text-orange-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {finding.status === "in_progress"
                          ? "In Progress"
                          : finding.status.charAt(0).toUpperCase() + finding.status.slice(1)}
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
