"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  ChevronDown,
  Edit,
  Lock,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { GenericAddUserModal } from "@/components/users/generic-add-user-modal"
import userState, { isUserAdmin } from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [changePasswordUser, setChangePasswordUser] = useState<string | null>(null)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatNewPassword, setRepeatNewPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showRepeatNewPassword, setShowRepeatNewPassword] = useState(false)
  const [userGroups, setUserGroups] = useState<{ [username: string]: string[] }>({})
  const groupsFetchedRef = useRef(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [fullPageLoading, setFullPageLoading] = useState(true)

  // Get users from state
  const { users, loading, error } = useSnapshot(userState)
  const { loading: changePwLoading, error: changePwError, success: changePwSuccess } = useSnapshot(userState)

  // Load users on component mount
  useEffect(() => {
    userState.getUsers()
  }, [])

  // Fetch groups for all users after users are loaded
  useEffect(() => {
    if (users.length > 0 && !groupsFetchedRef.current) {
      groupsFetchedRef.current = true
      Promise.all(
        users.map(async (user) => {
          try {
            const groups = await userState.fetchUserGroups(user.username)
            return { username: user.username, groups: groups || [] }
          } catch {
            return { username: user.username, groups: [] }
          }
        })
      ).then((results) => {
        const map: { [username: string]: string[] } = {}
        results.forEach(({ username, groups }) => {
          map[username] = groups
        })
        setUserGroups(map)
        localStorage.setItem('userGroups', JSON.stringify(map))
      })
    }
  }, [users])

  // Get logged-in user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "null")
        setCurrentUser(stored?.[0] || null)
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.enabled && user.status === "CONFIRMED").length
  const adminUsers = users.filter((user) => userGroups[user.username]?.includes("administrators")).length
  const pendingInvitations = users.filter((user) => user.status === "FORCE_CHANGE_PASSWORD").length
  const lockedAccounts = users.filter((user) => !user.enabled).length

  // Get logged-in user's admin status
  const isAdmin = currentUser ? isUserAdmin(currentUser, userGroups) : false

  // Helper to determine if the Remove Admin option should be disabled for the current user
  const isSelf = (username: string) => currentUser === username

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Since we don't have role information, we'll skip role filtering if not "all"
    const matchesRole = roleFilter === "all"

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.enabled && user.status === "CONFIRMED") ||
      (statusFilter === "inactive" && !user.enabled) ||
      (statusFilter === "locked" && !user.enabled) ||
      (statusFilter === "pending" && user.status === "FORCE_CHANGE_PASSWORD") ||
      user.status === "RESET_REQUIRED"

    return matchesSearch && (roleFilter === "all" || matchesRole) && matchesStatus
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  // Calculate last login (we'll use last_modified as a proxy since we don't have actual login data)
  const getLastLogin = (lastModified: string) => {
    try {
      const modifiedDate = new Date(lastModified)
      const now = new Date()
      const diffMs = now.getTime() - modifiedDate.getTime()
      const diffMins = Math.round(diffMs / 60000)

      if (diffMins < 60) {
        return `${diffMins} minutes ago`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} hours ago`
      } else {
        return `${Math.floor(diffMins / 1440)} days ago`
      }
    } catch (e) {
      return "Unknown"
    }
  }

  // Handler for opening the modal (only for current user, for now just allow for any user)
  const handleOpenChangePassword = (userEmail: string) => {
    setChangePasswordUser(userEmail)
    setIsChangePasswordModalOpen(true)
    setOldPassword("")
    setNewPassword("")
    setRepeatNewPassword("")
    setFormError(null)
  }

  // Handler for submitting the change password form
  const { toast } = useToast()
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!oldPassword || !newPassword || !repeatNewPassword) {
      setFormError("All fields are required.")
      return
    }
    if (newPassword !== repeatNewPassword) {
      setFormError("New passwords do not match.")
      return
    }
    try {
      await userState.changeMyPassword(oldPassword, newPassword)
      setIsChangePasswordModalOpen(false)
      toast({
        title: "Password changed successfully!",
        description: "Your password has been updated.",
      })
    } catch (err) {
      // error handled in state
    }
  }

  // Handler for toggling admin status
  const handleToggleAdmin = async (username: string) => {
    try {
      if (userGroups[username]?.includes("administrators")) {
        await userState.removeAdmin(username)
      } else {
        await userState.makeAdmin(username)
      }
      // Refresh groups for this user
      const groups = await userState.fetchUserGroups(username)
      setUserGroups((prev) => ({ ...prev, [username]: groups || [] }))
    } catch (err) {
      // Optionally show a toast or error
    }
  }

  // Handler for enabling/disabling a user by username
  const handleToggleUserEnabled = async (user: any) => {
    try {
      if (user.enabled) {
        await userState.disableUserByUsername(user.username)
      } else {
        await userState.enableUserByUsername(user.username)
      }
      // Refresh users
      await userState.getUsers()
    } catch (err) {
      // Optionally show a toast or error
    }
  }

  // Handler for opening the delete user modal
  const handleOpenDeleteUser = (user: any) => {
    setUserToDelete(user)
    setDeleteUserModalOpen(true)
  }

  // Handler for confirming delete user
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await userState.deleteUserByUsername(userToDelete.username)
      setDeleteUserModalOpen(false)
      setUserToDelete(null)
      await userState.getUsers()
      toast({
        title: "User deleted successfully!",
        description: "The user has been removed from the system.",
      })
    } catch (err) {
      // Optionally show a toast or error
      toast({
        title: "Error deleting user",
        description: "An error occurred while deleting the user. Please try again later.",
      })
    }
  }

  useEffect(() => {
    // Wait for users, userGroups, and currentUser to be loaded
    if (
      !loading &&
      users.length > 0 &&
      Object.keys(userGroups).length === users.length &&
      currentUser !== null
    ) {
      setFullPageLoading(false)
    }
  }, [loading, users, userGroups, currentUser])

  if (fullPageLoading) {
    return (
      <div className="flex flex-1 h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="User Management"
        description="Manage users and access control"
        actions={
          isAdmin && (
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsAddUserModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">{activeUsers} active users</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Administrators</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{adminUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">With full system access</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Pending Invitations</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{pendingInvitations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserPlus className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">Awaiting acceptance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Locked Accounts</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{lockedAccounts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">Due to security policies</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0f1d24] border-orange-600/20">
          <CardHeader>
            <CardTitle className="text-orange-500">Users</CardTitle>
            <CardDescription>Manage system users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/*
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px]">
                    Role: {roleFilter === "all" ? "All" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter("all")}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("administrators")}>administrators</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("users")}>User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px]">
                    Status:{" "}
                    {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("locked")}>Locked</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center">Error loading users: {error}</div>
            ) : (
              <>
                {/* Mobile: Card/List layout */}
                <div className="block md:hidden space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.username} className="rounded-xl border border-orange-600/20 bg-[#0f1d24] p-4 flex flex-col gap-3 shadow-sm relative">
                        {/* Action menu top-right */}
                        <div className="absolute top-4 right-4 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {isAdmin ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleAdmin(user.username)}
                                    disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {userGroups[user.username]?.includes("administrators")
                                      ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin")
                                      : "Make Admin"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleOpenChangePassword(user.email)}>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Change Password
                                  </DropdownMenuItem>
                                  {user.enabled ? (
                                    <DropdownMenuItem onClick={() => handleToggleUserEnabled(user)}>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Disable User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleToggleUserEnabled(user)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Enable User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleOpenDeleteUser(user)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem onClick={() => handleOpenChangePassword(user.email)}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Change Password
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {/* Main info */}
                        <div className="flex flex-col gap-1 pr-12">
                          <span className="font-semibold text-base text-orange-400 break-all">{user.email}</span>
                          <span className="text-xs text-muted-foreground break-all">{user.username}</span>
                        </div>
                        {/* Status/Admin row */}
                        <div className="flex items-center gap-3 mt-2">
                          {/* Status */}
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {user.enabled && user.status === "CONFIRMED" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : !user.enabled ? (
                              <Lock className="h-4 w-4 text-red-500" />
                            ) : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD" ? (
                              <UserPlus className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Users className="h-4 w-4 text-gray-500" />
                            )}
                            <span className={user.enabled && user.status === "CONFIRMED" ? "text-green-500" : !user.enabled ? "text-red-500" : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD" ? "text-yellow-500" : "text-gray-500"}>{user.status}</span>
                          </span>
                          {/* Admin */}
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                            <span className={userGroups[user.username]?.includes("administrators") ? "text-orange-500" : "text-muted-foreground"}>{userGroups[user.username]?.includes("administrators") ? "Admin" : "User"}</span>
                          </span>
                        </div>
                        {/* Divider */}
                        <div className="border-t border-orange-600/10 my-2" />
                        {/* Dates/info */}
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span><span className="font-medium text-foreground">Last Modified:</span> {formatDate(user.last_modified)}</span>
                          <span><span className="font-medium text-foreground">Created At:</span> {formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Desktop: Table layout */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Is Admin</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.username}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {user.enabled && user.status === "CONFIRMED" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                ) : !user.enabled ? (
                                  <Lock className="h-4 w-4 text-red-500 mr-1" />
                                ) : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD" ? (
                                  <UserPlus className="h-4 w-4 text-yellow-500 mr-1" />
                                ) : (
                                  <Users className="h-4 w-4 text-gray-500 mr-1" />
                                )}
                                <span
                                  className={
                                    user.enabled && user.status === "CONFIRMED"
                                      ? "text-green-500"
                                      : !user.enabled
                                        ? "text-red-500"
                                        : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD"
                                          ? "text-yellow-500"
                                          : "text-gray-500"
                                  }
                                >
                                  {user.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(user.last_modified)}</TableCell>
                            <TableCell>{formatDate(user.created_at)}</TableCell>
                            <TableCell>{userGroups[user.username]?.includes("administrators") ? "True" : "False"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  {isAdmin ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleAdmin(user.username)}
                                        disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        {userGroups[user.username]?.includes("administrators")
                                          ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin")
                                          : "Make Admin"}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleOpenChangePassword(user.email)}>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Change Password
                                      </DropdownMenuItem>
                                      {user.enabled ? (
                                        <DropdownMenuItem onClick={() => handleToggleUserEnabled(user)}>
                                          <Lock className="h-4 w-4 mr-2" />
                                          Disable User
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={() => handleToggleUserEnabled(user)}>
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Enable User
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-500" onClick={() => handleOpenDeleteUser(user)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete User
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleOpenChangePassword(user.email)}>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Change Password
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <GenericAddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          setIsAddUserModalOpen(false)
          userState.getUsers() // Refresh the user list when a new user is added
          toast({
            title: "User added successfully!",
            description: "The user has been added to the system.",
          })
        }}
      />
      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <Input
              type={showOldPassword ? "text" : "password"}
              placeholder="Old Password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              onClick={() => setShowOldPassword((v) => !v)}
              tabIndex={-1}
            >
              {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              onClick={() => setShowNewPassword((v) => !v)}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showRepeatNewPassword ? "text" : "password"}
              placeholder="Repeat New Password"
              value={repeatNewPassword}
              onChange={e => setRepeatNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
              onClick={() => setShowRepeatNewPassword((v) => !v)}
              tabIndex={-1}
            >
              {showRepeatNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          {changePwError && <div className="text-red-500 text-sm">{changePwError}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsChangePasswordModalOpen(false)} disabled={changePwLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={changePwLoading}>
              {changePwLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={deleteUserModalOpen}
        onClose={() => setDeleteUserModalOpen(false)}
        title="Confirm Delete User"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete user <span className="font-bold">{userToDelete?.email}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteUserModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDeleteUser}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
