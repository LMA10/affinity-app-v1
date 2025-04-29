export const getToken = (token: string, expiration: string, clearSession: () => void): string | null => {
  if (!token) return null

  // Check if token is expired
  if (expiration && Number.parseInt(expiration, 10) < Date.now()) {
    clearSession()
    return null
  }

  return token
}

// Helper to get a cookie value
export const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}