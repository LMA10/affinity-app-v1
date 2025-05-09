"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, Lock, UserPlus, Shield, Users } from "lucide-react"
import React from "react"

interface UsersTableProps {
  users: any[]
  userGroups: { [username: string]: string[] }
  isAdmin: boolean
  isSelf: (username: string) => boolean
  onToggleAdmin: (username: string) => void
  onToggleUserEnabled: (user: any) => void
  onChangePassword: (email: string) => void
  onDeleteUser: (user: any) => void
}

export function UsersTable({
  users,
  userGroups,
  isAdmin,
  isSelf,
  onToggleAdmin,
  onToggleUserEnabled,
  onChangePassword,
  onDeleteUser,
}: UsersTableProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="rounded-md border bg-[#CAD0D2] dark:bg-[#0D1315] relative">
      {/* Desktop Table */}
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
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
                    <div className="flex gap-1 justify-end">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleAdmin(user.username)}
                          disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                          title={userGroups[user.username]?.includes("administrators") ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin") : "Make Admin"}
                        >
                          <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onChangePassword(user.email)} title="Change Password">
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleUserEnabled(user)}
                        title={user.enabled ? "Disable User" : "Enable User"}
                      >
                        {user.enabled ? <Lock className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUser(user)}
                          title="Delete User"
                        >
                          <MoreHorizontal className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card/List Layout */}
      <div className="block md:hidden space-y-4 p-2">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          users.map((user: any) => (
            <div key={user.username} className="rounded-xl border border-orange-600/20 bg-[#0f1d24] p-4 flex flex-col gap-3 shadow-sm relative">
              <div className="flex flex-col gap-1 pr-12">
                <span className="font-semibold text-base text-orange-400 break-all">{user.email}</span>
                <span className="text-xs text-muted-foreground break-all">{user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
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
                <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                <span className={userGroups[user.username]?.includes("administrators") ? "text-orange-500" : "text-muted-foreground"}>{userGroups[user.username]?.includes("administrators") ? "Admin" : "User"}</span>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span><span className="font-medium text-foreground">Last Modified:</span> {formatDate(user.last_modified)}</span>
                <span><span className="font-medium text-foreground">Created At:</span> {formatDate(user.created_at)}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleAdmin(user.username)}
                    disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                    title={userGroups[user.username]?.includes("administrators") ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin") : "Make Admin"}
                  >
                    <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onChangePassword(user.email)} title="Change Password">
                  <Lock className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleUserEnabled(user)}
                  title={user.enabled ? "Disable User" : "Enable User"}
                >
                  {user.enabled ? <Lock className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteUser(user)}
                    title="Delete User"
                  >
                    <MoreHorizontal className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 