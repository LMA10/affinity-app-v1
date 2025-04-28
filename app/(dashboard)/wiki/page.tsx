import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WikiPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Knowledge Base" description="Documentation and guides for the Affinity platform" />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-[#0f1d24] border border-orange-600/20">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Affinity Platform</CardTitle>
                <CardDescription>A comprehensive security information and event management solution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Introduction</h3>
                <p>
                  Affinity is a next-generation security information and event management platform designed to help
                  organizations monitor, detect, and respond to security threats across their infrastructure. The
                  platform integrates with multiple cloud providers and security tools to provide a unified view of your
                  security posture.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Key Features</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Multi-cloud security monitoring (AWS, Azure, GCP, GitHub)</li>
                  <li>Real-time threat detection and alerting</li>
                  <li>Comprehensive log management and analysis</li>
                  <li>Compliance status monitoring and reporting</li>
                  <li>Interactive dashboards and visualizations</li>
                </ul>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Getting Started</h3>
                <p>
                  To get started with Affinity, navigate to the Analytics section to view security insights across
                  your connected cloud providers. The Cloud Status section provides real-time information about the
                  security posture of your cloud resources. Use the Logs and Alerts sections to investigate security
                  events and respond to threats.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Platform Architecture</CardTitle>
                <CardDescription>
                  Understanding the components and data flow of the Affinity platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Core Components</h3>
                <p>The Affinity platform consists of several interconnected components:</p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Data Collection</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Agents and API integrations that collect security events and logs from various sources including
                      cloud providers, on-premises systems, and security tools.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Data Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Real-time processing pipeline that normalizes, enriches, and correlates security events to
                      identify patterns and potential threats.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Analytics Engine</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Advanced analytics capabilities including machine learning models that detect anomalies and
                      identify sophisticated attack patterns.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Visualization Layer</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Interactive dashboards and reports that provide actionable insights into your security posture and
                      help identify areas for improvement.
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Data Flow</h3>
                <p>Security data flows through the platform in the following sequence:</p>
                <ol className="list-decimal pl-6 space-y-2 mt-2">
                  <li>Collection: Data is collected from cloud providers, on-premises systems, and security tools</li>
                  <li>Ingestion: Raw data is ingested into the platform's data lake</li>
                  <li>Processing: Data is normalized, enriched, and correlated</li>
                  <li>Analysis: Advanced analytics identify patterns, anomalies, and potential threats</li>
                  <li>Visualization: Insights are presented through interactive dashboards and reports</li>
                  <li>Response: Automated or manual response actions are triggered based on detected threats</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-sources" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Supported Data Sources</CardTitle>
                <CardDescription>
                  Cloud providers and security tools integrated with the Affinity platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Cloud Providers</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">AWS</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>CloudTrail</li>
                        <li>GuardDuty</li>
                        <li>Security Hub</li>
                        <li>VPC Flow Logs</li>
                        <li>S3 Access Logs</li>
                        <li>AWS Config</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Azure</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Azure Activity Logs</li>
                        <li>Azure Security Center</li>
                        <li>Azure Sentinel</li>
                        <li>Azure Monitor</li>
                        <li>Azure Network Watcher</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">GCP</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Cloud Audit Logs</li>
                        <li>Security Command Center</li>
                        <li>Cloud Logging</li>
                        <li>VPC Flow Logs</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">GitHub</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Audit Logs</li>
                        <li>Security Alerts</li>
                        <li>Dependabot Alerts</li>
                        <li>Code Scanning Alerts</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Security Tools</h3>
                <p>Affinity integrates with a wide range of security tools and technologies, including:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Endpoint Detection and Response (EDR) solutions</li>
                  <li>Network security appliances and firewalls</li>
                  <li>Identity and Access Management (IAM) systems</li>
                  <li>Vulnerability management tools</li>
                  <li>Threat intelligence platforms</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Analytics Capabilities</CardTitle>
                <CardDescription>Understanding the analytics features of the Affinity platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Security Analytics</h3>
                <p>
                  Affinity provides comprehensive security analytics capabilities to help you identify and respond
                  to threats:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Threat Detection</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Advanced algorithms and machine learning models that identify known and unknown threats based on
                      behavior patterns and anomalies in your environment.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Compliance Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Continuous assessment of your security posture against industry standards and regulatory
                      frameworks such as CIS, NIST, PCI DSS, HIPAA, and GDPR.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">User Behavior Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Monitoring of user activities to establish baselines and detect anomalous behaviors that may
                      indicate compromised accounts or insider threats.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">Cloud Security Posture</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Continuous monitoring of your cloud environments to identify misconfigurations, vulnerabilities,
                      and deviations from security best practices.
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Visualization and Reporting</h3>
                <p>
                  Affinity provides powerful visualization and reporting capabilities to help you understand your
                  security posture:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Interactive dashboards with drill-down capabilities</li>
                  <li>Real-time monitoring of security events and alerts</li>
                  <li>Customizable reports for different stakeholders</li>
                  <li>Trend analysis to identify patterns over time</li>
                  <li>Compliance reports for regulatory requirements</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
