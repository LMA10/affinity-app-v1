import { proxy } from "valtio"
import userService from "../../services/userService"
import sessionState from "../sessionState/sessionState"
import { getToken } from "../../utils/auth"
import listView from "../list/listView"
import type { UsersResponse } from "../../types/user"

// Update the User interface to match our new structure
interface ProcessedUser {
  username: string
  email: string
  email_verified: boolean
  status: string
  enabled: boolean
  created_at: string
  last_modified: string
}

interface Group {
  id: string
  name: string
}

interface UserAttribute {
  Name: string
  Value: string
}

interface RawUser {
  Username: string
  Attributes: UserAttribute[]
  UserCreateDate: string
  UserLastModifiedDate: string
  Enabled: boolean
  UserStatus: string
}

interface RawResponse {
  statusCode: number
  body: {
    body: RawUser[]
  }
}

// Update the UsersState interface
interface UsersState {
  users: ProcessedUser[]
  groups: Group[]
  loading: boolean
  error: string | null
  success: boolean
  loginMessage: any
  loadUsers: () => Promise<void>
  loadGroups: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, admin: boolean) => Promise<any>
  confirmRegistration: (email: string, confirmationCode: string) => Promise<void>
  fetchUserGroups: (email: string) => Promise<Group[] | null>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  disableUser: (email: string) => Promise<void>
  deleteUser: (email: string) => Promise<void>
  enableUser: (email: string) => Promise<void>
  resetUserPassword: (email: string) => Promise<any>
  logout: () => void
}

const usersState = proxy<UsersState>({
  users: [],
  groups: [],
  loading: false,
  error: null,
  success: false,
  loginMessage: null,

  // Update the loadUsers function
  async loadUsers() {
    usersState.loading = true
    usersState.error = null
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      const usersArray = await userService.fetchUsers(token) // Ahora User[]
      
      const users = usersArray.map((user) => ({
        username: user.username,
        email: user.attributes?.email || "",
        email_verified: user.attributes?.email_verified === "true",
        status: user.status,
        enabled: user.enabled,
        created_at: user.created_at,
        last_modified: user.last_modified,
      }))

      usersState.users = users

      const columns = users.length > 0
        ? Object.keys(users[0]).map((key) => ({
            key,
            label: key.toUpperCase(),
          }))
        : []

      listView.setListData(users)
      listView.setVisibleColumns(columns)

    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    } finally {
      usersState.loading = false
    }
  },

  async loadGroups() {
    usersState.loading = true
    usersState.error = null
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      const groups = await userService.fetchGroups(token)
      usersState.groups = groups
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    } finally {
      usersState.loading = false
    }
  },

  // Update the login function to handle the refreshToken
  login: async (email: string, password: string) => {
    try {
      usersState.loading = true
      usersState.error = null
      usersState.success = false

      const response = await userService.login(email, password)

      if (response.success) {
        usersState.loginMessage = response.message
        usersState.success = true
        usersState.error = null

        // Save the session with the new refreshToken
        sessionState.saveSession(
          response.message.token,
          response.message.accessToken,
          response.message.refreshToken || "",
          response.message.expiration,
        )
      } else {
        usersState.loginMessage = null
        usersState.success = false
        usersState.error = response.message.error
      }
    } catch (error) {
      usersState.loginMessage = null
      usersState.success = false
      usersState.error = error instanceof Error ? error.message : String(error)
    } finally {
      usersState.loading = false
    }
  },

  async register(email: string, password: string, admin: boolean) {
    usersState.loading = true
    usersState.error = null
    try {
      const response = await userService.register(email, password, admin)
      return response
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      usersState.loading = false
    }
  },

  async confirmRegistration(email: string, confirmationCode: string) {
    usersState.loading = true
    usersState.error = null
    try {
      const response = await userService.confirmRegistration(email, confirmationCode)
      return response
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      usersState.loading = false
    }
  },

  async fetchUserGroups(email: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return null

    try {
      return await userService.fetchUserGroups(token, email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      return null
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      await userService.changePassword(token, oldPassword, newPassword)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async disableUser(email: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      await userService.disableUser(token, email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async deleteUser(email: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      await userService.deleteUser(token, email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async enableUser(email: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      await userService.enableUser(token, email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async resetUserPassword(email: string) {
    const token = getToken(sessionState.token, sessionState.expiration, sessionState.clearSession)
    if (!token) return

    try {
      const response = await userService.resetUserPassword(token, email)
      return response
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  logout() {
    // Call the logout function from userService
    userService.logout()

    // Reset state
    usersState.success = false
    usersState.loginMessage = null
    usersState.users = []
    usersState.groups = []
    usersState.error = null
  },
})

export default usersState
