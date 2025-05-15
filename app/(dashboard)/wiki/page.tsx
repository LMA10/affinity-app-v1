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
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Affinity Platform</CardTitle>
                <CardDescription>Cybersecurity that scales with your vision.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <p>
                  Affinity is a cloud-native security platform built for modern teams — from agile startups to growing tech-driven companies. We bring real-time alerts, deep log analysis, and seamless data integrations into a unified space designed for speed, clarity, and action.
                </p>
                <p>
                  Whether you're a one-person security team or scaling fast, Affinity empowers you with tools to detect threats, investigate incidents, and continuously strengthen your security posture — all without the enterprise bloat.
                </p>
                <h4 className="text-orange-400 font-bold mt-6">Built by Solidarity Labs</h4>
                <p>
                  Born from the belief that security should be accessible, efficient, and empowering — not overwhelming. We design with purpose, for the people.
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Lightning Fast Search</h4>
                    <p>Instantly find the data you need, no matter how large your environment.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Real-Time Alerts</h4>
                    <p>Get notified about what matters most, right when it happens.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Effortless Collaboration</h4>
                    <p>Share insights and investigations with your team in a single click.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Enterprise-Grade Security</h4>
                    <p>Built from the ground up for organizations that demand the best.</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-[#1a2a32] border-l-4 border-orange-500 rounded">
                  <b>Pro Tip:</b> Use the sidebar for one-click access to every major feature. Affinity is designed for speed and clarity.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Logs</CardTitle>
                <CardDescription>How to use the Logs page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Powerful Log Analysis—Made for Experts</h3>
                <p>
                  Affinity's log management is built for security teams who need answers fast and with precision. Go beyond basic search—use advanced tools to investigate, correlate, and export exactly what you need.
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">SQL Query Builder</h4>
                    <p>Write and run custom SQL queries directly on your logs. Get the exact data you need, every time.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Advanced Filtering</h4>
                    <p>Filter logs by any field, time range, or value—combine multiple filters for pinpoint accuracy.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">SQL Query Editor</h4>
                    <p>Use the built-in editor for complex queries, with syntax highlighting and instant results.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Export & Investigate</h4>
                    <p>Export results for compliance or reporting, or jump straight into an investigation from any log entry.</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-[#1a2a32] border-l-4 border-orange-500 rounded">
                  <b>Pro Tip:</b> Use the SQL Query Editor to automate repetitive investigations and save your favorite queries for future use.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Security Alerts</CardTitle>
                <CardDescription>Monitor and respond to security alerts across your infrastructure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Actionable Security Alerts—Built for Real-World Threats</h3>
                <p>
                  Affinity's alerting system is designed for the challenges big companies face every day. Detect, investigate, and resolve incidents with the tools your team actually needs.
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Real-World Use Cases</h4>
                    <p>Alerts are tailored to the threats that matter most—privilege escalation, suspicious logins, data exfiltration, and more.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Instant Query & Investigation</h4>
                    <p>See the exact query that triggered any alert. Instantly pivot to related logs and start your investigation with a click.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Full Alert Management</h4>
                    <p>Recategorize severity, assign owners, mark as false positive, or close alerts—all from one place.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Export alert data for external analysis or team collaboration.</h4>
                    <p>Download alert details as JSON, and easily share findings with your team via your preferred communication channels or ticketing systems</p>
                  </div>  
                </div>
                <div className="mt-4 p-4 bg-[#1a2a32] border-l-4 border-orange-500 rounded">
                  <b>Pro Tip:</b> Use the alerts query as a launchpad—investigate related events, escalate, or resolve them.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Management</CardTitle>
                <CardDescription>Manage notifications, integrations, and users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Total Control, Zero Hassle</h3>
                <p>
                  Affinity's management tools put you in the driver's seat. Configure notifications, connect integrations, and manage users—all in one place.
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Flexible Notifications</h4>
                    <p>Set up channels like Email, Slack, or Telegram to get alerts your way.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Easy Integrations</h4>
                    <p>Easily ingest data from sources like AWS CloudTrail, GuardDuty, WAF, VPC Flow Logs, GitHub, Google Workspace, and more.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">User Management</h4>
                    <p>Add, remove, and control the user access to the platform.</p>
                  </div>
                  <div className="p-4 bg-[#181f23] rounded border border-orange-600/20">
                    <h4 className="text-orange-400 font-bold mb-1">Always Secure</h4>
                    <p>Keep your environment safe with regular reviews and easy account management.</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-[#1a2a32] border-l-4 border-orange-500 rounded">
                  <b>Pro Tip:</b> Regularly review your integrations and user permissions to keep your environment secure and efficient.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
