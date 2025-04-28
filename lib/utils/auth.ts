export const getToken = (token: string, expiration: string, clearSession: () => void): string | null => {
  if (!token) return null

  // Check if token is expired
  if (expiration && Number.parseInt(expiration, 10) < Date.now()) {
    clearSession()
    return null
  }

  return token
}
