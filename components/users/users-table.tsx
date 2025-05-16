"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, CheckCircle, Lock, UserPlus, Shield, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Username</TableHead>
              <TableHead className="font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Status</TableHead>
              <TableHead className="font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Last Modified</TableHead>
              <TableHead className="font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Created At</TableHead>
              <TableHead className="font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Is Admin</TableHead>
              <TableHead className="text-right font-['Helvetica'] font-normal text-[#849DA6] dark:text-[#849DA6] text-[#506C77]">Actions</TableHead>
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
              users.map((user: any, idx: number) => (
                <TableRow 
                  key={user.username}
                  className={`border-b transition 
                    ${idx % 2 === 0 ? 'bg-[#E8E8E8] dark:bg-[#142A33]' : 'bg-[#CAD0D2] dark:bg-[#0D1315]'}
                    hover:bg-[#F3DED1] dark:hover:bg-[#252422]`}
                >
                  <TableCell className="font-['Helvetica'] font-normal text-[14px] text-[#EA661B] py-2">{user.email}</TableCell>
                  <TableCell className="py-2">
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
                        className={`font-['IBM_Plex_Mono'] font-normal text-[14px] ${
                          user.enabled && user.status === "CONFIRMED"
                            ? "text-green-500"
                            : !user.enabled
                            ? "text-red-500"
                            : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD"
                            ? "text-yellow-500"
                            : "text-gray-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-['Helvetica'] font-normal text-[14px]">{formatDate(user.last_modified)}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-['Helvetica'] font-normal text-[14px]">{formatDate(user.created_at)}</span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={`font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5 ${
                        userGroups[user.username]?.includes("administrators")
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-gray-500 text-white border-gray-500"
                      }`}
                    >
                      {userGroups[user.username]?.includes("administrators") ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleAdmin(user.username)}
                          disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                          title={userGroups[user.username]?.includes("administrators") ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin") : "Make Admin"}
                          className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                        >
                          <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onChangePassword(user.email)} 
                        title="Change Password"
                        className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleUserEnabled(user)}
                        title={user.enabled ? "Disable User" : "Enable User"}
                        className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                      >
                        {user.enabled ? <Lock className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#506C77] dark:text-[#849DA6] hover:bg-[#F3DED1] dark:hover:bg-[#252422] hover:text-[#142A33] dark:hover:text-[#FFFFFF]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#CAD0D2] dark:bg-[#0D1315] border-[#506C77]">
                          <DropdownMenuLabel className="text-[#506C77] dark:text-[#849DA6] font-normal font-['Helvetica','Arial',sans-serif]">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#506C77]" />
                          <DropdownMenuItem
                            onClick={() => onDeleteUser(user)}
                            className="text-[#506C77] dark:text-[#849DA6] hover:bg-[#F3DED1] dark:hover:bg-[#252422] hover:text-[#142A33] dark:hover:text-[#FFFFFF] font-normal font-['Helvetica','Arial',sans-serif]"
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card/List Layout */}
      <div className="block md:hidden">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <div className="flex flex-col gap-4 p-2">
            {users.map((user: any, idx: number) => (
              <div
                key={user.username}
                className={`rounded-lg border p-4 flex flex-col gap-2 shadow-sm 
                  ${idx % 2 === 0 ? 'bg-[#E8E8E8] dark:bg-[#142A33]' : 'bg-[#CAD0D2] dark:bg-[#0D1315]'}`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-['Helvetica'] font-normal text-[14px] text-[#EA661B]">{user.email}</span>
                  <div className="flex items-center gap-2">
                    {user.enabled && user.status === "CONFIRMED" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : !user.enabled ? (
                      <Lock className="h-4 w-4 text-red-500" />
                    ) : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD" ? (
                      <UserPlus className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Users className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`font-['IBM_Plex_Mono'] font-normal text-[14px] ${
                      user.enabled && user.status === "CONFIRMED"
                        ? "text-green-500"
                        : !user.enabled
                        ? "text-red-500"
                        : user.status === "RESET_REQUIRED" || user.status === "FORCE_CHANGE_PASSWORD"
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-col">
                      <span className="font-['Helvetica'] font-normal text-[14px]">Last Modified:</span>
                      <span className="font-['Helvetica'] font-normal text-[14px]">{formatDate(user.last_modified)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-['Helvetica'] font-normal text-[14px]">Created At:</span>
                      <span className="font-['Helvetica'] font-normal text-[14px]">{formatDate(user.created_at)}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-['IBM_Plex_Mono'] font-normal rounded-[4px] text-[10px] px-1.5 py-0.5 ${
                      userGroups[user.username]?.includes("administrators")
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-500 text-white border-gray-500"
                    }`}
                  >
                    {userGroups[user.username]?.includes("administrators") ? "Admin" : "User"}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleAdmin(user.username)}
                      disabled={userGroups[user.username]?.includes("administrators") && isSelf(user.username)}
                      title={userGroups[user.username]?.includes("administrators") ? (isSelf(user.username) ? "Remove Admin (Not allowed for self)" : "Remove Admin") : "Make Admin"}
                      className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                    >
                      <Shield className={userGroups[user.username]?.includes("administrators") ? "h-4 w-4 text-orange-500" : "h-4 w-4 text-muted-foreground"} />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onChangePassword(user.email)} 
                    title="Change Password"
                    className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleUserEnabled(user)}
                    title={user.enabled ? "Disable User" : "Enable User"}
                    className="hover:bg-[#F3DED1] dark:hover:bg-[#252422]"
                  >
                    {user.enabled ? <Lock className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#506C77] dark:text-[#849DA6] hover:bg-[#F3DED1] dark:hover:bg-[#252422] hover:text-[#142A33] dark:hover:text-[#FFFFFF]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#CAD0D2] dark:bg-[#0D1315] border-[#506C77]">
                      <DropdownMenuLabel className="text-[#506C77] dark:text-[#849DA6] font-normal font-['Helvetica','Arial',sans-serif]">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#506C77]" />
                      <DropdownMenuItem
                        onClick={() => onDeleteUser(user)}
                        className="text-[#506C77] dark:text-[#849DA6] hover:bg-[#F3DED1] dark:hover:bg-[#252422] hover:text-[#142A33] dark:hover:text-[#FFFFFF] font-normal font-['Helvetica','Arial',sans-serif]"
                      >
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 