"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { BarChart, AreaChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockAwsData } from "@/lib/mock-data"

// Define explicit colors for charts
const areaChartColors = ["#f97316"]
const barChartColors = ["#f97316"]

export default function AwsAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="AWS Analytics" description="Security analytics for AWS resources" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>EC2 Instances</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAwsData.ec2Instances}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {mockAwsData.ec2InstancesUnpatched} unpatched instances
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>S3 Buckets</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAwsData.s3Buckets}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAwsData.s3BucketsPublic} public buckets</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>IAM Users</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAwsData.iamUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">{mockAwsData.iamUsersWithoutMFA} without MFA enabled</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Security Groups</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAwsData.securityGroups}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {mockAwsData.securityGroupsWithIssues} with security issues
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="events">CloudTrail Events</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-4">
              <CardHeader className="px-0">
                <CardTitle className="text-orange-500">CloudTrail Events</CardTitle>
                <CardDescription>Security events from AWS CloudTrail</CardDescription>
              </CardHeader>

              <AreaChart
                data={mockAwsData.cloudTrailEvents}
                index="date"
                categories={["events"]}
                colors={areaChartColors}
                valueFormatter={(value) => `${value.toLocaleString()} events`}
                showLegend={false}
                height="h-[350px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Vulnerabilities by Service</CardTitle>
                <CardDescription>Distribution of vulnerabilities across AWS services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <BarChart
                    data={mockAwsData.vulnerabilitiesByService}
                    index="service"
                    categories={["count"]}
                    colors={barChartColors}
                    valueFormatter={(value) => `${value} vulnerabilities`}
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
              <CardTitle className="text-orange-500">Recent Security Findings</CardTitle>
              <CardDescription>Security findings from AWS Security Hub</CardDescription>
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
                  <TableHead>Service</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAwsData.securityFindings.map((finding, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{finding.title}</TableCell>
                    <TableCell>{finding.resource}</TableCell>
                    <TableCell>{finding.service}</TableCell>
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
                            : finding.status === "investigating"
                              ? "bg-orange-500/20 text-orange-500"
                              : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {finding.status}
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
