"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, BarChart, AreaChart } from "@/components/charts"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Filter } from "lucide-react"
import { githubCspmPostures, githubCspmSummary } from "@/lib/mock-data"

// Define explicit colors for charts
const pieChartColors = ["#10b981", "#f97316", "#ef4444"]
const barChartColors = ["#10b981", "#f97316", "#ef4444"]
const areaChartColors = ["#10b981", "#f97316", "#ef4444"]

export default function CloudGithubPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [enabledPostures, setEnabledPostures] = useState<number[]>(githubCspmPostures.map((posture) => posture.id))

  const togglePosture = (id: number) => {
    if (enabledPostures.includes(id)) {
      setEnabledPostures(enabledPostures.filter((postureId) => postureId !== id))
    } else {
      setEnabledPostures([...enabledPostures, id])
    }
  }

  const criticalFindings = githubCspmPostures.filter(
    (posture) => posture.status === "critical" && enabledPostures.includes(posture.id),
  )

  const pieChartData = [
    { name: "Compliant", value: githubCspmSummary.compliantResources },
    { name: "Warning", value: githubCspmSummary.warningResources },
    { name: "Critical", value: githubCspmSummary.criticalResources },
  ]

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="GitHub Security Posture" description="Cloud Security Posture Management for GitHub" />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Compliance Score</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{githubCspmSummary.complianceScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Last scan: {githubCspmSummary.lastScan}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Resources</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{githubCspmSummary.totalResources}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {githubCspmSummary.compliantResources} compliant resources
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Warning Findings</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{githubCspmSummary.warningResources}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Require attention</div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Critical Findings</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{githubCspmSummary.criticalResources}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Require immediate action</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posture-checks">Posture Checks</TabsTrigger>
            <TabsTrigger value="trends">Compliance Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0f1d24] border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-orange-500">Compliance Status</CardTitle>
                  <CardDescription>Distribution of resource compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart
                      data={pieChartData}
                      index="name"
                      category="value"
                      colors={pieChartColors}
                      valueFormatter={(value) => `${value} resources`}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0f1d24] border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-orange-500">Compliance by Category</CardTitle>
                  <CardDescription>Security posture across resource categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart
                      data={githubCspmSummary.categoryCompliance}
                      index="category"
                      categories={["compliant", "warning", "critical"]}
                      colors={barChartColors}
                      valueFormatter={(value) => `${value} resources`}
                      stack
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-orange-500">Critical Findings</CardTitle>
                  <CardDescription>Issues requiring immediate attention</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finding</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Affected Resources</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalFindings.length > 0 ? (
                      criticalFindings.map((finding) => (
                        <TableRow key={finding.id}>
                          <TableCell className="font-medium">{finding.name}</TableCell>
                          <TableCell>{finding.category}</TableCell>
                          <TableCell>{finding.affectedResources}</TableCell>
                          <TableCell>{finding.lastChecked}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Critical
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          No critical findings detected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posture-checks" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-orange-500">GitHub Security Posture Checks</CardTitle>
                  <CardDescription>Status of all security posture checks</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posture Check</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Affected Resources</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Enabled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {githubCspmPostures.map((posture) => (
                      <TableRow key={posture.id} className={!enabledPostures.includes(posture.id) ? "opacity-60" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{posture.name}</span>
                            <span className="text-xs text-muted-foreground">{posture.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>{posture.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {posture.status === "compliant" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : posture.status === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge
                              variant="outline"
                              className={
                                posture.status === "compliant"
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : posture.status === "warning"
                                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                              }
                            >
                              {posture.status.charAt(0).toUpperCase() + posture.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{posture.affectedResources}</TableCell>
                        <TableCell>{posture.lastChecked}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={enabledPostures.includes(posture.id)}
                              onCheckedChange={() => togglePosture(posture.id)}
                              aria-label={`Toggle ${posture.name}`}
                            />
                            <span className="text-xs">
                              {enabledPostures.includes(posture.id) ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Compliance Trends</CardTitle>
                <CardDescription>7-day trend of security posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <AreaChart
                    data={githubCspmSummary.trendData}
                    index="date"
                    categories={["compliant", "warning", "critical"]}
                    colors={areaChartColors}
                    valueFormatter={(value) => `${value} resources`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
