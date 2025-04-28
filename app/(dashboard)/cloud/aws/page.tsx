"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, BarChart, PieChart } from "@/components/charts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Filter, RefreshCw, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"
import { awsCspmPostures, awsCspmSummary } from "@/lib/mock-data"

export default function AWSPage() {
  const [activeTab, setActiveTab] = useState("overview")
  // Track enabled/disabled state for each posture check
  const [enabledPostures, setEnabledPostures] = useState<Record<number, boolean>>(
    // Initialize all postures as enabled
    awsCspmPostures.reduce(
      (acc, posture) => {
        acc[posture.id] = true
        return acc
      },
      {} as Record<number, boolean>,
    ),
  )

  // Toggle posture enabled/disabled
  const togglePosture = (id: number) => {
    setEnabledPostures((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Calculate summary numbers
  const compliantCount = awsCspmPostures.filter((p) => p.status === "compliant").length
  const warningCount = awsCspmPostures.filter((p) => p.status === "warning").length
  const criticalCount = awsCspmPostures.filter((p) => p.status === "critical").length

  // Prepare data for pie chart
  const complianceData = [
    { name: "Compliant", value: compliantCount },
    { name: "Warning", value: warningCount },
    { name: "Critical", value: criticalCount },
  ]

  // Prepare data for category compliance chart
  const categoryData = awsCspmSummary.categoryCompliance.map((cat) => ({
    category: cat.category,
    compliant: cat.compliant,
    warning: cat.warning,
    critical: cat.critical,
  }))

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        heading="AWS Cloud Security Posture"
        text="Monitor and enforce security best practices across your AWS environment"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0a1419] border-orange-600/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{awsCspmSummary.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Last scan: {awsCspmSummary.lastScan}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a1419] border-orange-600/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{awsCspmSummary.totalResources}</div>
            <p className="text-xs text-muted-foreground">{awsCspmSummary.compliantResources} compliant resources</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a1419] border-orange-600/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warning Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{awsCspmSummary.warningResources}</div>
            <p className="text-xs text-muted-foreground">Across {warningCount} posture checks</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a1419] border-orange-600/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{awsCspmSummary.criticalResources}</div>
            <p className="text-xs text-muted-foreground">Across {criticalCount} posture checks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#0a1419] border-orange-600/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="postures">Posture Checks</TabsTrigger>
          <TabsTrigger value="trends">Compliance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#0a1419] border-orange-600/10">
              <CardHeader>
                <CardTitle className="text-orange-500">Compliance Status</CardTitle>
                <CardDescription>Current status of security posture checks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart
                    data={complianceData}
                    index="name"
                    category="value"
                    colors={["#10b981", "#f97316", "#ef4444"]}
                    valueFormatter={(value) => `${value} checks`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a1419] border-orange-600/10">
              <CardHeader>
                <CardTitle className="text-orange-500">Compliance by Category</CardTitle>
                <CardDescription>Security posture across resource categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    data={categoryData}
                    index="category"
                    categories={["compliant", "warning", "critical"]}
                    colors={["#10b981", "#f97316", "#ef4444"]}
                    valueFormatter={(value) => `${value}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#0a1419] border-orange-600/10">
            <CardHeader>
              <CardTitle className="text-orange-500">Critical Findings</CardTitle>
              <CardDescription>High priority security issues requiring immediate attention</CardDescription>
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
                  {awsCspmPostures
                    .filter((posture) => posture.status === "critical")
                    .map((posture) => (
                      <TableRow key={posture.id}>
                        <TableCell className="font-medium">{posture.name}</TableCell>
                        <TableCell>{posture.category}</TableCell>
                        <TableCell>{posture.affectedResources}</TableCell>
                        <TableCell>{posture.lastChecked}</TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                            Critical
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postures" className="mt-4">
          <Card className="bg-[#0a1419] border-orange-600/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-orange-500">Security Posture Checks</CardTitle>
                <CardDescription>AWS security best practices and compliance checks</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posture Check</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Affected</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awsCspmPostures.map((posture) => (
                    <TableRow key={posture.id} className={!enabledPostures[posture.id] ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{posture.name}</TableCell>
                      <TableCell>{posture.category}</TableCell>
                      <TableCell className="max-w-xs truncate">{posture.description}</TableCell>
                      <TableCell>{posture.affectedResources}</TableCell>
                      <TableCell>{posture.lastChecked}</TableCell>
                      <TableCell>
                        {posture.status === "compliant" && (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Compliant
                          </Badge>
                        )}
                        {posture.status === "warning" && (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                        )}
                        {posture.status === "critical" && (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                            <ShieldX className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={enabledPostures[posture.id]}
                            onCheckedChange={() => togglePosture(posture.id)}
                            aria-label={`Toggle ${posture.name}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {enabledPostures[posture.id] ? "Enabled" : "Disabled"}
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

        <TabsContent value="trends" className="mt-4">
          <Card className="bg-[#0a1419] border-orange-600/10">
            <CardHeader>
              <CardTitle className="text-orange-500">Compliance Trend</CardTitle>
              <CardDescription>Security posture improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <AreaChart
                  data={awsCspmSummary.trendData}
                  index="date"
                  categories={["compliant", "warning", "critical"]}
                  colors={["#10b981", "#f97316", "#ef4444"]}
                  valueFormatter={(value) => `${value} resources`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
