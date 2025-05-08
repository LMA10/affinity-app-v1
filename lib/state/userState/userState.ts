import { proxy } from "valtio"
import userService, { makeAdmin as makeAdminService, removeAdmin as removeAdminService } from "../../services/userService"
import sessionState from "../sessionState/sessionState"
import { getUsers, User, Group, getCurrentUser } from "@/lib/services/userService"

// Update the UsersState interface
export interface UsersState {
  users: User[]
  groups: Group[]
  loading: boolean
  error: string | null
  success: boolean
  loginMessage: any
  getUsers: () => Promise<void>
  loadGroups: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<any>
  confirmRegistration: (email: string, confirmationCode: string) => Promise<void>
  fetchUserGroups: (username: string) => Promise<string[] | null>
  changeMyPassword: (old_password: string, new_password: string) => Promise<void>
  disableUser: (email: string) => Promise<void>
  deleteUser: (email: string) => Promise<void>
  enableUser: (email: string) => Promise<void>
  resetUserPassword: (email: string) => Promise<any>
  logout: () => void
  fetchAndStoreCurrentUser: () => Promise<void>
  makeAdmin: (username: string) => Promise<void>
  removeAdmin: (username: string) => Promise<void>
  enableUserByUsername: (username: string) => Promise<void>
  disableUserByUsername: (username: string) => Promise<void>
  deleteUserByUsername: (username: string) => Promise<void>
}

export const usersState = proxy<UsersState>({
  users: [],
  groups: [],
  loading: false,
  error: null,
  success: false,
  loginMessage: null,

  async getUsers() {
    usersState.loading = true
    usersState.error = null
    try {
      const users = await getUsers()
      usersState.users = users
    } catch (e: any) {
      usersState.error = e.message || "Failed to fetch users"
    } finally {
      usersState.loading = false
    }
  },

  async loadGroups() {
    usersState.loading = true
    usersState.error = null
    try {
      const groups = await userService.fetchGroups()
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
        // Fetch and store the current user info after login
        await usersState.fetchAndStoreCurrentUser()
      } else if (response.message.statusCode === 202) {
        usersState.loginMessage = response.message
        usersState.success = false
        usersState.error = null
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

  async register(email: string, password: string) {
    usersState.loading = true
    usersState.error = null
    try {
      const response = await userService.register(email, password)
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
      if (response.statusCode === 200 && response.body?.message === "Registration Confirmed") {
        usersState.success = true
        return response
      } else {
        throw new Error(response.body?.message || "Failed to confirm registration")
      }
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      usersState.loading = false
    }
  },

  async fetchUserGroups(username: string) {
    try {
      return await userService.fetchUserGroups(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      return null
    }
  },

  async changeMyPassword(old_password: string, new_password: string) {
    usersState.loading = true
    usersState.error = null
    usersState.success = false
    try {
      await userService.changeMyPassword(old_password, new_password)
      usersState.success = true
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      usersState.success = false
    } finally {
      usersState.loading = false
    }
  },

  async disableUser(email: string) {
    try {
      await userService.disableUser(email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async deleteUser(email: string) {
    try {
      await userService.deleteUser(email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async enableUser(email: string) {
    try {
      await userService.enableUser(email)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  async resetUserPassword(email: string) {
    try {
      const response = await userService.resetUserPassword(email)
      return response
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  async fetchAndStoreCurrentUser() {
    try {
      const [userId, email] = await getCurrentUser();
      localStorage.setItem('currentUser', JSON.stringify([userId, email]));
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
    }
  },

  logout() {
    // Call the logout function from userService
    userService.logout()

    // Remove currentUser from localStorage
    localStorage.removeItem('currentUser')
    localStorage.removeItem('expiration')

    // Reset state
    usersState.success = false
    usersState.loginMessage = null
    usersState.users = []
    usersState.groups = []
    usersState.error = null
  },

  async makeAdmin(username: string) {
    try {
      await makeAdminService(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  async removeAdmin(username: string) {
    try {
      await removeAdminService(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  async enableUserByUsername(username: string) {
    try {
      await userService.enableUserByUsername(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  async disableUserByUsername(username: string) {
    try {
      await userService.disableUserByUsername(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  async deleteUserByUsername(username: string) {
    try {
      await userService.deleteUserByUsername(username)
    } catch (error) {
      usersState.error = error instanceof Error ? error.message : String(error)
      throw error
    }
  },
})

// Utility function to check if a user is admin by username
export function isUserAdmin(username: string, userGroups: { [username: string]: string[] }): boolean {
  return userGroups[username]?.includes("administrators") ?? false;
}

export default usersState
