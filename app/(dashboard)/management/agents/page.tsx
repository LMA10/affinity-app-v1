"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAgentsData } from "@/lib/mock-data"
import {
  CheckCircle,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("deployed")

  // Filter agents based on search query and filters
  const filteredAgents = mockAgentsData.agentHealth.filter((agent) => {
    const matchesSearch =
      searchQuery === "" ||
      agent.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || agent.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Agent Management"
        description="Deploy and manage security agents across your infrastructure"
        actions={
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Deploy New Agent
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Agents</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAgentsData.totalAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Server className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">{mockAgentsData.activeAgents} active agents</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Healthy Agents</CardDescription>
              <CardTitle className="text-2xl text-green-500">
                {mockAgentsData.agentStatusDistribution.find((a) => a.status === "healthy")?.count || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-muted-foreground">Fully operational</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Agents with Issues</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{mockAgentsData.agentsWithIssues}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-xs text-muted-foreground">{mockAgentsData.criticalIssues} critical issues</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Outdated Agents</CardDescription>
              <CardTitle className="text-2xl text-yellow-500">{mockAgentsData.outdatedAgents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-xs text-muted-foreground">Need immediate update</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deployed" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="deployed">Deployed Agents</TabsTrigger>
            <TabsTrigger value="templates">Deployment Templates</TabsTrigger>
            <TabsTrigger value="settings">Agent Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="deployed" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent ID</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Check-in</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent, index) => (
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
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update Agent
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Run Security Scan
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Server className="h-4 w-4 mr-2" />
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Uninstall Agent
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#0f1d24] border-orange-600/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-orange-500">Linux Server</CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Default
                    </Badge>
                  </div>
                  <CardDescription>Standard deployment for Linux servers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">OS:</span>
                    <span>Linux (Ubuntu, CentOS, RHEL)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>3.2.1 (Latest)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Features:</span>
                    <span>Full Security Suite</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#0f1d24] border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-500">Windows Workstation</CardTitle>
                  <CardDescription>Optimized for Windows endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">OS:</span>
                    <span>Windows 10/11</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>3.2.1 (Latest)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Features:</span>
                    <span>Endpoint Protection</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#0f1d24] border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-500">Cloud Container</CardTitle>
                  <CardDescription>Lightweight agent for containerized environments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform:</span>
                    <span>Docker, Kubernetes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>3.2.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Features:</span>
                    <span>Container Security</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#0f1d24] border-orange-600/20 border-dashed border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-muted-foreground">Create New Template</CardTitle>
                  <CardDescription>Define a custom agent deployment template</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                  <Button variant="outline" size="lg" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Global Agent Settings</CardTitle>
                <CardDescription>Configure default settings for all agents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-update">Automatic Updates</Label>
                    <Switch id="auto-update" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically update agents when new versions are available
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telemetry">Telemetry Collection</Label>
                    <Switch id="telemetry" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">Collect performance and diagnostic data from agents</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-interval">Check-in Interval (minutes)</Label>
                  <Input id="check-interval" type="number" defaultValue="5" min="1" max="60" />
                  <p className="text-sm text-muted-foreground">
                    How often agents should check in with the management server
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-retention">Log Retention (days)</Label>
                  <Input id="log-retention" type="number" defaultValue="30" min="1" max="365" />
                  <p className="text-sm text-muted-foreground">How long to retain agent logs</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scan-schedule">Default Scan Schedule</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="scan-schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Default schedule for security scans</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-orange-600 hover:bg-orange-700">Save Settings</Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Agent Policies</CardTitle>
                <CardDescription>Define security policies for agents</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Applied To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Default Security Policy</TableCell>
                      <TableCell>Standard security controls for all agents</TableCell>
                      <TableCell>All Agents</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">High Security Policy</TableCell>
                      <TableCell>Enhanced security for sensitive systems</TableCell>
                      <TableCell>Production Servers</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Development Policy</TableCell>
                      <TableCell>Balanced security for development environments</TableCell>
                      <TableCell>Dev Workstations</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
