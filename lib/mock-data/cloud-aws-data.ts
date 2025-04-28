// Mock data for Cloud AWS Status
export const mockCloudAwsData = {
  overallStatus: "degraded",
  totalServices: 32,
  servicesOperational: 29,
  totalRegions: 25,
  regionsOperational: 23,
  regionsWithIssues: 2,
  activeIncidents: 3,
  criticalIncidents: 1,
  serviceCategories: [
    {
      name: "Compute",
      services: [
        { name: "EC2", status: "operational" },
        { name: "Lambda", status: "operational" },
        { name: "ECS", status: "operational" },
        { name: "EKS", status: "degraded" },
      ],
    },
    {
      name: "Storage",
      services: [
        { name: "S3", status: "operational" },
        { name: "EBS", status: "operational" },
        { name: "EFS", status: "operational" },
        { name: "Glacier", status: "operational" },
      ],
    },
    {
      name: "Database",
      services: [
        { name: "RDS", status: "operational" },
        { name: "DynamoDB", status: "disrupted" },
        { name: "ElastiCache", status: "operational" },
        { name: "Redshift", status: "operational" },
      ],
    },
    {
      name: "Networking",
      services: [
        { name: "VPC", status: "operational" },
        { name: "Route 53", status: "operational" },
        { name: "CloudFront", status: "operational" },
        { name: "API Gateway", status: "degraded" },
      ],
    },
  ],
  incidents: [
    {
      service: "DynamoDB",
      region: "us-east-1",
      description: "Increased error rates and latency for DynamoDB operations",
      started: "2025-04-14 06:32 UTC",
      status: "investigating",
    },
    {
      service: "EKS",
      region: "eu-west-1",
      description: "Customers may experience issues creating new EKS clusters",
      started: "2025-04-14 07:15 UTC",
      status: "identified",
    },
    {
      service: "API Gateway",
      region: "us-west-2",
      description: "Intermittent 5xx errors for some API Gateway endpoints",
      started: "2025-04-14 08:03 UTC",
      status: "investigating",
    },
  ],
}
