import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LegalPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Legal Information" description="Terms of service, privacy policy, and legal documentation" />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="bg-[#0f1d24] border border-orange-600/20">
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Terms of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">1. Acceptance of Terms</h3>
                <p>
                  By accessing or using the Affinity platform ("Service"), you agree to be bound by these Terms of
                  Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">2. Description of Service</h3>
                <p>
                  Affinity is a security information and event management platform that provides security
                  monitoring, threat detection, and compliance management capabilities for cloud and on-premises
                  environments.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">3. User Accounts</h3>
                <p>
                  To access the Service, you must create an account. You are responsible for maintaining the
                  confidentiality of your account credentials and for all activities that occur under your account. You
                  agree to notify us immediately of any unauthorized use of your account.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">4. Data Collection and Use</h3>
                <p>
                  The Service collects and processes security events, logs, and other data from your environment. This
                  data is used to provide the security monitoring and threat detection capabilities of the Service. By
                  using the Service, you grant us the right to collect and process this data in accordance with our
                  Privacy Policy.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">5. Intellectual Property</h3>
                <p>
                  The Service and its original content, features, and functionality are owned by Affinity and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual property
                  or proprietary rights laws.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">6. Limitation of Liability</h3>
                <p>
                  In no event shall Affinity, its directors, employees, partners, agents, suppliers, or affiliates be
                  liable for any indirect, incidental, special, consequential, or punitive damages, including without
                  limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                  access to or use of or inability to access or use the Service.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">7. Governing Law</h3>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction],
                  without regard to its conflict of law provisions.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">8. Changes to Terms</h3>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">9. Contact Us</h3>
                <p>If you have any questions about these Terms, please contact us at support@solidaritylabs.io</p>

                <p className="mt-6 text-sm text-gray-400">Last updated: April 15, 2025</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">1. Introduction</h3>
                <p>
                  This Privacy Policy describes how Affinity ("we", "our", or "us") collects, uses, and shares
                  information in connection with your use of the Affinity platform ("Service").
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">2. Information We Collect</h3>
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    <strong>Account Information:</strong> When you create an account, we collect your name, email
                    address, and other contact information.
                  </li>
                  <li>
                    <strong>Security Data:</strong> We collect security events, logs, and other data from your
                    environment to provide the security monitoring and threat detection capabilities of the Service.
                  </li>
                  <li>
                    <strong>Usage Information:</strong> We collect information about how you use the Service, including
                    your interactions with the user interface and API calls.
                  </li>
                  <li>
                    <strong>Device Information:</strong> We collect information about the device you use to access the
                    Service, including IP address, browser type, and operating system.
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-orange-400 mt-6">3. How We Use Information</h3>
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>To provide and maintain the Service</li>
                  <li>To detect and prevent security threats</li>
                  <li>To improve and personalize the Service</li>
                  <li>To communicate with you about the Service</li>
                  <li>To comply with legal obligations</li>
                </ul>

                <h3 className="text-lg font-medium text-orange-400 mt-6">4. Information Sharing</h3>
                <p>
                  We do not sell your information to third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>With service providers who help us operate the Service</li>
                  <li>With your consent or at your direction</li>
                  <li>To comply with legal obligations</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                </ul>

                <h3 className="text-lg font-medium text-orange-400 mt-6">5. Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect your information from
                  unauthorized access, disclosure, alteration, and destruction.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">6. Your Rights</h3>
                <p>
                  Depending on your location, you may have certain rights regarding your information, such as the right
                  to access, correct, delete, or restrict processing of your information.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">7. Changes to this Policy</h3>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last updated" date.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">8. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at support@solidaritylabs.io.
                </p>

                <p className="mt-6 text-sm text-gray-400">Last updated: April 15, 2025</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Compliance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <h3 className="text-lg font-medium text-orange-400">Regulatory Compliance</h3>
                <p>
                  Affinity is designed to help organizations meet their compliance requirements. The platform
                  itself adheres to the following standards and regulations:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">SOC 2 Type II</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Affinity has completed a SOC 2 Type II audit, which verifies that our security controls meet the
                      criteria for security, availability, and confidentiality.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">ISO 27001</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Affinity is ISO 27001 certified, demonstrating our commitment to information security management
                      and continuous improvement.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">GDPR</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Affinity is designed to help organizations comply with the General Data Protection Regulation
                      (GDPR) and includes features to support data protection requirements.
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a1419] border-orange-600/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-orange-500">HIPAA</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Affinity includes controls and features to help healthcare organizations comply with the
                      Health Insurance Portability and Accountability Act (HIPAA).
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Data Processing Agreements</h3>
                <p>
                  Affinity offers Data Processing Agreements (DPAs) to customers who require them for compliance with
                  data protection regulations. To request a DPA, please contact support@solidaritylabs.io.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Compliance Documentation</h3>
                <p>The following compliance documentation is available to customers upon request:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>SOC 2 Type II Report</li>
                  <li>ISO 27001 Certificate</li>
                  <li>Penetration Test Summary</li>
                  <li>Security Whitepaper</li>
                  <li>Vendor Risk Assessment Questionnaire</li>
                </ul>

                <p className="mt-6">
                  To request compliance documentation, please contact support@solidaritylabs.io.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses" className="mt-6">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardHeader>
                <CardTitle className="text-orange-500">Open Source Licenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <p>
                  Affinity incorporates open source software components. We acknowledge and appreciate the
                  contributions of the open source community to our platform.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Key Open Source Components</h3>

                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-[#0a1419] rounded-md border border-orange-600/20">
                    <h4 className="font-medium text-orange-400">React</h4>
                    <p className="text-sm mt-1">A JavaScript library for building user interfaces.</p>
                    <p className="text-xs mt-2 text-gray-400">License: MIT License</p>
                  </div>

                  <div className="p-4 bg-[#0a1419] rounded-md border border-orange-600/20">
                    <h4 className="font-medium text-orange-400">Next.js</h4>
                    <p className="text-sm mt-1">A React framework for production-grade applications.</p>
                    <p className="text-xs mt-2 text-gray-400">License: MIT License</p>
                  </div>

                  <div className="p-4 bg-[#0a1419] rounded-md border border-orange-600/20">
                    <h4 className="font-medium text-orange-400">Tailwind CSS</h4>
                    <p className="text-sm mt-1">A utility-first CSS framework.</p>
                    <p className="text-xs mt-2 text-gray-400">License: MIT License</p>
                  </div>

                  <div className="p-4 bg-[#0a1419] rounded-md border border-orange-600/20">
                    <h4 className="font-medium text-orange-400">Recharts</h4>
                    <p className="text-sm mt-1">A composable charting library built on React components.</p>
                    <p className="text-xs mt-2 text-gray-400">License: MIT License</p>
                  </div>

                  <div className="p-4 bg-[#0a1419] rounded-md border border-orange-600/20">
                    <h4 className="font-medium text-orange-400">Lucide React</h4>
                    <p className="text-sm mt-1">A beautiful & consistent icon toolkit made by the community.</p>
                    <p className="text-xs mt-2 text-gray-400">License: ISC License</p>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Full License Information</h3>
                <p>
                  The full text of the licenses for all open source components used in Affinity is available in the
                  platform's documentation. You can also request a complete list of open source components and their
                  licenses by contacting support@solidaritylabs.io.
                </p>

                <h3 className="text-lg font-medium text-orange-400 mt-6">Contributing to Open Source</h3>
                <p>
                  Affinity is committed to supporting the open source community. We contribute to various open source
                  projects and release selected components of our platform as open source software.
                </p>

                <p className="mt-6 text-sm text-gray-400">Last updated: April 15, 2025</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
