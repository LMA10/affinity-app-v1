// Enhanced mock alerts with more timestamps for filtering
export const enhancedMockAlerts = [
  // Today's alerts
  {
    id: "alert-001",
    timestamp: new Date().toISOString(),
    severity: "critical",
    title: "Potential Data Exfiltration Detected",
    description: "Unusual outbound data transfer of 2.3GB detected from database server to external IP 203.0.113.42.",
    source: "Network Monitor",
    status: "open",
  },
  {
    id: "alert-002",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    severity: "high",
    title: "Brute Force Authentication Attempt",
    description: "Multiple failed login attempts (25+) detected for admin account from IP 198.51.100.73.",
    source: "Auth Service",
    status: "investigating",
  },

  // Yesterday's alerts
  {
    id: "alert-003",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    severity: "medium",
    title: "Unusual API Access Pattern",
    description: "User 'api-client' accessed sensitive endpoints in an unusual sequence.",
    source: "API Gateway",
    status: "investigating",
  },
  {
    id: "alert-004",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
    severity: "low",
    title: "New Admin User Created",
    description: "New administrator account 'backup-admin' was created by user 'jsmith'.",
    source: "IAM",
    status: "resolved",
  },

  // Last week's alerts
  {
    id: "alert-005",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    severity: "critical",
    title: "Ransomware Behavior Detected",
    description:
      "Endpoint protection detected file encryption patterns consistent with ransomware on workstation WS-DEV-042.",
    source: "Endpoint Protection",
    status: "investigating",
  },
  {
    id: "alert-006",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    severity: "high",
    title: "Suspicious Process Execution",
    description: "PowerShell executed with encoded command parameters on server SRV-PROD-015.",
    source: "EDR",
    status: "open",
  },

  // Last month's alerts
  {
    id: "alert-007",
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    severity: "medium",
    title: "Firewall Rule Modification",
    description: "Production firewall rules were modified to allow additional inbound traffic on port 22 (SSH).",
    source: "Firewall",
    status: "resolved",
  },
  {
    id: "alert-008",
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    severity: "low",
    title: "SSL Certificate Expiring Soon",
    description: "SSL certificate for api.company.com will expire in 15 days.",
    source: "Certificate Monitor",
    status: "open",
  },

  // Older alerts
  {
    id: "alert-009",
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    severity: "high",
    title: "Potential SQL Injection Attempt",
    description: "Web application firewall detected and blocked multiple SQL injection attempts.",
    source: "WAF",
    status: "false_positive",
  },
  {
    id: "alert-010",
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    severity: "critical",
    title: "Unauthorized Infrastructure Change",
    description: "Terraform detected unauthorized changes to production infrastructure.",
    source: "IaC Scanner",
    status: "investigating",
  },
]
