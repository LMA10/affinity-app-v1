import config from "../config/configDev"
// import sessionState from "../state/sessionState/sessionState"

// Import the new user interfaces
import type { UsersResponse, User } from "../types/user"

const urlapi = config.urlAPI

const logout = (): void => {
  // Clear session state
  // sessionState.clearSession()

  // Clear localStorage items
  localStorage.removeItem("dateRange")
  localStorage.removeItem("token")
  localStorage.removeItem("accToken")
  localStorage.removeItem("expiration")

  // Clear any other application-specific storage
  try {
    // Clear all localStorage items that might contain user data
    const keysToKeep: string[] = [] // Add any keys you want to keep here

    Object.keys(localStorage).forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    // Clear session storage as well
    sessionStorage.clear()

    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

  } catch (error) {
  }
}

interface UserDetails {
  Username: string
  email: string | null
  email_verified: boolean | null
  UserCreateDate: string
  UserLastModifiedDate: string
  Enabled: boolean
  UserStatus: string
}

interface Group {
  id: string
  name: string
}

// Helper to get a cookie value
function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}

// Update the login function to handle the new response structure
const login = async (email: string, password: string): Promise<{ success: boolean; message: any }> => {
  try {
    const response = await fetch(`${urlapi}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    })

    const responseData = await response.json()

    // Handle the response format
    if (responseData.statusCode === 200 && responseData.body) {
      // The body is already an object, no need to parse it
      const tokenData = responseData.body

      // Check if id_token exists
      if (tokenData.id_token) {
        return {
          success: true,
          message: {
            token: tokenData.id_token,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            // Use the expires_in value from the response
            expiration: tokenData.expires_in || 3600,
          },
        }
      }
    }

    // Handle error responses
    let errorMessage = "An error occurred during login"

    // Check if there's an error in the response
    if (responseData.body && responseData.body.error) {
      errorMessage = responseData.body.error.message || responseData.body.error
    }

    return {
      success: false,
      message: {
        statusCode: responseData.statusCode || 500,
        error: errorMessage,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: {
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

const createHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Authorization: getCookie("token") || '',
  }
}

const createBearerHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getCookie("token") || ''}`,
  }
}

const register = async (email: string, password: string, admin: boolean): Promise<any> => {
  try {
    const response = await fetch(`${urlapi}/auth/signup`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({
        username: email, // Using email as username as per requirements
        email,
        password,
      }),
    })
    if (!response.ok) {
      throw new Error("Failed to register user")
    }
    return response.json()
  } catch (error) {
    throw error
  }
}

const confirmRegistration = async (email: string, confirmationCode: string): Promise<any> => {
  try {
    const response = await fetch(`${urlapi}/auth/confirm-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, confirmation_code: confirmationCode }),
    })
    return response.json()
  } catch (error) {
    throw error
  }
}

// Update the fetchUsers function to use the new endpoint
const fetchUsers = async (): Promise<User[]> => {
  try {
    const token = getCookie("token") || '';
    if (!token) {
      throw new Error("No authorization token found");
    }

    const response = await fetch(`${urlapi}/auth/users/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      } as HeadersInit,
    });

    const text = await response.text();
    const responseData = text ? JSON.parse(text) : null;

    if (!responseData) {
      throw new Error("Empty or invalid JSON response");
    }

    let parsedBody: any;
    if (typeof responseData.body === "string") {
      parsedBody = JSON.parse(responseData.body);
    } else {
      parsedBody = responseData.body;
    }

    // 💥 Nueva validación acá
    if (parsedBody?.error) {
      //console.error("Error in body:", parsedBody.error);
      throw new Error(parsedBody.error.message || "Internal server error");
    }

    if (!parsedBody?.users || !Array.isArray(parsedBody.users)) {
      // 💬 En vez de explotar, puede retornar []
      return [];
    }

    return parsedBody.users;
  } catch (error) {
    //console.error("Error fetching users:", error);
    throw error;
  }
};

// Removed whoami function since it's not working

const fetchUserGroups = async (email: string): Promise<Group[]> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/users/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
    })
    if (!response.ok) {
      throw new Error("Failed to fetch user groups")
    }
    return response.json()
  } catch (error) {
    //console.error("Error fetching user groups:", error)
    throw error
  }
}

const fetchGroups = async (): Promise<Group[]> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
    })
    if (!response.ok) {
      throw new Error("Failed to fetch groups")
    }
    return response.json()
  } catch (error) {
    //console.error("Error fetching groups:", error)
    throw error
  }
}

const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    if (!response.ok) {
      throw new Error("Failed to change password")
    }
  } catch (error) {
    //console.error("Error changing password:", error)
    throw error
  }
}

const disableUser = async (email: string): Promise<void> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/disable-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ email }),
    })
    if (!response.ok) {
      throw new Error("Failed to disable user")
    } 
  } catch (error) {
    //console.error("Error disabling user:", error)
    throw error
  }
}

const deleteUser = async (email: string): Promise<void> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ email }),
    })
    if (!response.ok) {
      throw new Error("Failed to delete user")
    }
  } catch (error) {
    //console.error("Error deleting user:", error)
    throw error
  }
}

const enableUser = async (email: string): Promise<void> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/enable-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ email }),
    })
    if (!response.ok) {
      throw new Error("Failed to enable user")
    } 
  } catch (error) {
    //console.error("Error enabling user:", error)
    throw error
  }
}

const resetUserPassword = async (email: string): Promise<any> => {
  try {
    const token = getCookie("token") || '';
    const response = await fetch(`${urlapi}/auth/admin/reset-user-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ email }),
    })
    if (!response.ok) {
      throw new Error("Failed to reset user password")
    }
    return response.json()
  } catch (error) {
    //console.error("Error resetting user password:", error)
    throw error
  }
}

const userService = {
  login,
  register,
  confirmRegistration,
  fetchUsers,
  fetchUserGroups,
  fetchGroups,
  changePassword,
  disableUser,
  deleteUser,
  enableUser,
  resetUserPassword,
  logout,
}

export default userService
