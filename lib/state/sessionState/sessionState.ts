import { proxy, subscribe } from "valtio"
import CryptoJS from "crypto-js"

const SECRET_KEY = "djgmsk#mu(rzbp&hdp" // This should be replaced with a secure key in production

// Update the SessionState interface to include refreshToken
interface SessionState {
  token: string
  accessToken: string
  refreshToken: string
  expiration: string
  clearSession: () => void
  saveSession: (token: string, accessToken: string, refreshToken: string, expiration: number) => void
}

// Update the safeLocalStorage to handle the refreshToken
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch (error) {

      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch (error) {

    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch (error) {

    }
  },
}

const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
}

const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    safeLocalStorage.removeItem("token")
    safeLocalStorage.removeItem("accToken")
    safeLocalStorage.removeItem("expiration")
    return ""
  }
}

// Update the initializeState function to include refreshToken
const initializeState = () => {
  // Return default state if not in browser
  if (typeof window === "undefined") {
    return { token: "", accessToken: "", refreshToken: "", expiration: "" }
  }

  const savedIdToken = safeLocalStorage.getItem("token")
  const savedAccToken = safeLocalStorage.getItem("accToken")
  const savedRefreshToken = safeLocalStorage.getItem("refreshToken")
  const savedExpiration = safeLocalStorage.getItem("expiration")

  if (savedIdToken && savedAccToken && savedExpiration) {
    const expiration = Number.parseInt(savedExpiration, 10)
    if (Date.now() > expiration) {
      safeLocalStorage.removeItem("token")
      safeLocalStorage.removeItem("accToken")
      safeLocalStorage.removeItem("refreshToken")
      safeLocalStorage.removeItem("expiration")
      return { token: "", accessToken: "", refreshToken: "", expiration: "" }
    }

    try {
      const token = decryptData(savedIdToken)
      const accessToken = decryptData(savedAccToken)
      const refreshToken = savedRefreshToken ? decryptData(savedRefreshToken) : ""
      return { token, accessToken, refreshToken, expiration: savedExpiration }
    } catch {
      safeLocalStorage.removeItem("token")
      safeLocalStorage.removeItem("accToken")
      safeLocalStorage.removeItem("refreshToken")
      safeLocalStorage.removeItem("expiration")
      return { token: "", accessToken: "", refreshToken: "", expiration: "" }
    }
  }

  return { token: "", accessToken: "", refreshToken: "", expiration: "" }
}

// Update the sessionState object to include refreshToken
const sessionState: SessionState = proxy({
  ...initializeState(),
  refreshToken: "",

  clearSession() {
    sessionState.token = ""
    sessionState.accessToken = ""
    sessionState.refreshToken = ""
    sessionState.expiration = ""
    if (typeof window !== "undefined") {
      safeLocalStorage.removeItem("token")
      safeLocalStorage.removeItem("accToken")
      safeLocalStorage.removeItem("refreshToken")
      safeLocalStorage.removeItem("expiration")
    }
  },

  saveSession(token: string, accessToken: string, refreshToken: string, expiration: number) {
    sessionState.token = token
    sessionState.accessToken = accessToken
    sessionState.refreshToken = refreshToken
    sessionState.expiration = (Date.now() + expiration * 1000).toString()

    if (typeof window !== "undefined") {
      safeLocalStorage.setItem("token", encryptData(sessionState.token))
      safeLocalStorage.setItem("accToken", encryptData(sessionState.accessToken))
      if (refreshToken) {
        safeLocalStorage.setItem("refreshToken", encryptData(sessionState.refreshToken))
      }
      safeLocalStorage.setItem("expiration", sessionState.expiration)
    }
  },
})

// Update the subscribe function to handle refreshToken
if (typeof window !== "undefined") {
  subscribe(sessionState, () => {
    if (sessionState.token) {
      safeLocalStorage.setItem("token", encryptData(sessionState.token))
    } else {
      safeLocalStorage.removeItem("token")
    }
    if (sessionState.accessToken) {
      safeLocalStorage.setItem("accToken", encryptData(sessionState.accessToken))
    } else {
      safeLocalStorage.removeItem("accToken")
    }
    if (sessionState.refreshToken) {
      safeLocalStorage.setItem("refreshToken", encryptData(sessionState.refreshToken))
    } else {
      safeLocalStorage.removeItem("refreshToken")
    }
    safeLocalStorage.setItem("expiration", sessionState.expiration)
  })
}

export const getSessionState = () => sessionState

export default sessionState
