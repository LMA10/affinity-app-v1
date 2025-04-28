"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { AddUserModal } from "@/components/users/add-user-modal"
import userState from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)

  // Get users from state
  const { users, loading, error } = useSnapshot(userState)

  // Load users on component mount
  useEffect(() => {
    userState.loadUsers()
  }, [])

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.enabled && user.status === "CONFIRMED").length
  const adminUsers = 0 // We don't have role information in the current API response
  const pendingInvitations = users.filter((user) => user.status === "FORCE_CHANGE_PASSWORD").length
  const lockedAccounts = users.filter((user) => !user.enabled).length

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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="User Management"
        description="Manage users and access control"
        actions={
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px]">
                    Role: {roleFilter === "all" ? "All" : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setRoleFilter("all")}>All Roles</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("admin")}>Admin</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("analyst")}>Analyst</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("user")}>User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRoleFilter("readonly")}>Read Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Created At</TableHead>
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
                        <TableCell className="font-medium">{user.username}</TableCell>
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
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              {user.enabled ? (
                                <DropdownMenuItem>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Disable Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Enable Account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          setIsAddUserModalOpen(false)
          userState.loadUsers() // Refresh the user list when a new user is added
        }}
      />
    </div>
  )
}
