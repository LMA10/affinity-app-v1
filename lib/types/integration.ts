export interface Integration {
  bucket_prefix?: string
  bucket_name?: string
  integration_id: string
  keys_retrieved?: boolean
  auth_type?: string
  new_integration: boolean
  log_name?: string
  enabled: boolean
  github_enterprise?: string
  client: string
  auth_profile?: string
  region?: string
  github_organization?: string
  log_type: string
}

export interface IntegrationsResponse {
  statusCode: number
  body: {
    message: string
    Integrations: Integration[]
  }
  headers?: {
    "Content-Type": string
  }
  isBase64Encoded?: boolean
}
