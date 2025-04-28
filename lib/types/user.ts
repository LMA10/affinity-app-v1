export interface UserAttributes {
  email: string
  email_verified: string
  sub: string
}

export interface User {
  username: string
  status: string
  enabled: boolean
  created_at: string
  last_modified: string
  attributes: UserAttributes
}

export interface UsersResponseBody {
  users: User[]
  pagination_token: string | null
}

export interface UsersResponse {
  statusCode: number
  body: UsersResponseBody
  headers: {
    "Content-Type": string
  }
  isBase64Encoded: boolean
}

export interface LoginResponse {
  id_token: string
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}
