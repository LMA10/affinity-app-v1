import config from "../config/configDev"
import { getCookie } from "../utils/auth"
import sessionState from "../state/sessionState/sessionState"
import { isUserAdmin } from "../state/userState/userState"

const urlapi = config.urlAPI

export interface User {
  username: string;
  email: string;
  email_verified: boolean;
  status: string;
  enabled: boolean;
  created_at: string;
  last_modified: string;
  raw?: any;
}

export interface Group {
  id: string
  name: string
}

const logout = (): void => {
  // Only remove the keys you want to clear, leave pwaInstallDismissed and others untouched
  localStorage.removeItem("dateRange")
  localStorage.removeItem("token")
  localStorage.removeItem("accToken")
  localStorage.removeItem("expiration")

  // Clear session storage as well
  sessionStorage.clear()

  // Clear any cookies
  try {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
  } catch (error) {}
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

    if (
      responseData.statusCode === 200 &&
      responseData.body &&
      responseData.body.response &&
      responseData.body.response.AuthenticationResult
    ) {
      const auth = responseData.body.response.AuthenticationResult
      return {
        success: true,
        message: {
          token: auth.IdToken,
          accessToken: auth.AccessToken,
          refreshToken: auth.RefreshToken,
          expiration: auth.ExpiresIn || 3600,
        },
      }
    }

    // Handle error responses
    let errorMessage = "An error occurred during login"
    if (responseData.body && responseData.body.message) {
      errorMessage = responseData.body.message
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

const register = async (email: string, password: string): Promise<any> => {
  try {
    const token = sessionState.token || '';
    const response = await fetch(`${urlapi}/auth/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({
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
    const response = await fetch(`${urlapi}/auth/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email, 
        confirmation_code: confirmationCode 
      }),
    })
    if (!response.ok) {
      throw new Error("Failed to confirm registration")
    }
    const data = await response.json()
    if (data.statusCode !== 200) {
      throw new Error(data.body?.message || "Failed to confirm registration")
    }
    return data
  } catch (error) {
    throw error
  }
}

// Removed whoami function since it's not working

const fetchUserGroups = async (username: string): Promise<string[]> => {
  try {
    const token = sessionState.token || '';
    const accessToken = sessionState.accessToken || '';
    const response = await fetch(`${urlapi}/auth/users/${username}/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        AccessToken: accessToken,
      } as HeadersInit,
    })
    if (!response.ok) {
      throw new Error("Failed to fetch user groups")
    }
    const data = await response.json();
    return data.body && Array.isArray(data.body.groups) ? data.body.groups : [];
  } catch (error) {
    throw error;
  }
}

const fetchGroups = async (): Promise<Group[]> => {
  try {
    const token = sessionState.token || '';
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

function getCurrentUserAndGroups() {
  if (typeof window === 'undefined') return { currentUser: null, userGroups: {} };
  let currentUser = null;
  let userGroups = {};
  try {
    const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
    currentUser = stored?.[0] || null;
    userGroups = JSON.parse(localStorage.getItem('userGroups') || '{}');
  } catch {}
  return { currentUser, userGroups };
}

const disableUser = async (email: string): Promise<void> => {
  try {
    const token = sessionState.token || '';
    const { currentUser, userGroups } = getCurrentUserAndGroups();
    if (!isUserAdmin(currentUser, userGroups)) {
      throw new Error("You do not have permission to perform this action.");
    }
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
    throw error
  }
}

const deleteUser = async (email: string): Promise<void> => {
  try {
    const token = sessionState.token || '';
    const { currentUser, userGroups } = getCurrentUserAndGroups();
    if (!isUserAdmin(currentUser, userGroups)) {
      throw new Error("You do not have permission to perform this action.");
    }
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
    throw error
  }
}

const enableUser = async (email: string): Promise<void> => {
  try {
    const token = sessionState.token || '';
    const { currentUser, userGroups } = getCurrentUserAndGroups();
    if (!isUserAdmin(currentUser, userGroups)) {
      throw new Error("You do not have permission to perform this action.");
    }
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
    throw error
  }
}

const resetUserPassword = async (email: string): Promise<any> => {
  try {
    const token = sessionState.token || '';
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

export async function getUsers(): Promise<User[]> {
  const token = sessionState.token || '';
  if (!token) throw new Error("No authorization token found");

  const response = await fetch(`${urlapi}/auth/users/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });

  const data = await response.json();
  if (!data.body || !data.body.users) return [];
  return data.body.users.map((user: any) => {
    const emailAttr = user.Attributes.find((a: any) => a.Name === "email");
    const emailVerifiedAttr = user.Attributes.find((a: any) => a.Name === "email_verified");
    return {
      username: user.Username,
      email: emailAttr ? emailAttr.Value : "",
      email_verified: emailVerifiedAttr ? emailVerifiedAttr.Value === "true" : false,
      status: user.UserStatus,
      enabled: user.Enabled,
      created_at: user.UserCreateDate,
      last_modified: user.UserLastModifiedDate,
      raw: user,
    };
  });
}

// Change current user's password (me)
const changeMyPassword = async (old_password: string, new_password: string): Promise<void> => {
  try {
    const accessToken = sessionState.accessToken || '';
    const token = sessionState.token || '';
    const response = await fetch(`${urlapi}/auth/users/me/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AccessToken: accessToken,
        Authorization: token,
      } as HeadersInit,
      body: JSON.stringify({ old_password, new_password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to change password");
    }
  } catch (error) {
    throw error;
  }
}

// Fetch current user info (userId and email)
export const getCurrentUser = async (): Promise<[string, string]> => {
  const token = sessionState.token || '';
  const accessToken = sessionState.accessToken || '';
  const response = await fetch(`${urlapi}/auth/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      AccessToken: accessToken,
    } as HeadersInit,
  });
  const data = await response.json();
  if (
    data.statusCode === 200 &&
    data.body &&
    data.body.user_data &&
    data.body.user_data.Username &&
    Array.isArray(data.body.user_data.UserAttributes)
  ) {
    const userId = data.body.user_data.Username;
    const emailAttr = data.body.user_data.UserAttributes.find((attr: any) => attr.Name === "email");
    const email = emailAttr ? emailAttr.Value : "";
    return [userId, email];
  }
  throw new Error("Failed to fetch current user info");
}

// Make user admin
export const makeAdmin = async (username: string): Promise<any> => {
  const token = sessionState.token || '';
  const { currentUser, userGroups } = getCurrentUserAndGroups();
  if (!isUserAdmin(currentUser, userGroups)) {
    throw new Error("You do not have permission to perform this action.");
  }
  const response = await fetch(`${urlapi}/auth/admin/users/make-admin/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });
  if (!response.ok) {
    throw new Error("Failed to make user admin");
  }
  return response.json();
};

// Remove user from admin
export const removeAdmin = async (username: string): Promise<any> => {
  const token = sessionState.token || '';
  const { currentUser, userGroups } = getCurrentUserAndGroups();
  if (!isUserAdmin(currentUser, userGroups)) {
    throw new Error("You do not have permission to perform this action.");
  }
  if (currentUser && currentUser === username) {
    throw new Error("You cannot remove your own admin permission.");
  }
  const response = await fetch(`${urlapi}/auth/admin/users/remove-admin/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });
  if (!response.ok) {
    throw new Error("Failed to remove user from admin");
  }
  return response.json();
};

export const enableUserByUsername = async (username: string): Promise<any> => {
  const token = sessionState.token || '';
  const { currentUser, userGroups } = getCurrentUserAndGroups();
  if (!isUserAdmin(currentUser, userGroups)) {
    throw new Error("You do not have permission to perform this action.");
  }
  const response = await fetch(`${urlapi}/auth/admin/users/enable/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });
  if (!response.ok) {
    throw new Error("Failed to enable user");
  }
  return response.json();
};

export const disableUserByUsername = async (username: string): Promise<any> => {
  const token = sessionState.token || '';
  const { currentUser, userGroups } = getCurrentUserAndGroups();
  if (!isUserAdmin(currentUser, userGroups)) {
    throw new Error("You do not have permission to perform this action.");
  }
  const response = await fetch(`${urlapi}/auth/admin/users/disable/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });
  if (!response.ok) {
    throw new Error("Failed to disable user");
  }
  return response.json();
};

export const deleteUserByUsername = async (username: string): Promise<any> => {
  const token = sessionState.token || '';
  const { currentUser, userGroups } = getCurrentUserAndGroups();
  if (!isUserAdmin(currentUser, userGroups)) {
    throw new Error("You do not have permission to perform this action.");
  }
  const response = await fetch(`${urlapi}/auth/admin/users/${username}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    } as HeadersInit,
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
  return response.json();
};

const userService = {
  login,
  register,
  confirmRegistration,
  fetchUserGroups,
  fetchGroups,
  disableUser,
  deleteUser,
  enableUser,
  resetUserPassword,
  logout,
  getUsers,
  changeMyPassword,
  getCurrentUser,
  makeAdmin,
  removeAdmin,
  enableUserByUsername,
  disableUserByUsername,
  deleteUserByUsername,
}

export default userService
