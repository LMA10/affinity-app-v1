"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  Bell,
  Check,
  Edit,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddChannelModal } from "@/components/notifications/add-channel-modal"
import { EditChannelModal } from "@/components/notifications/edit-channel-modal"
import { useNotificationState } from "@/lib/state/notificationState/notificationState"
import type { NotificationChannel } from "@/lib/services/notificationService"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loading } from "@/components/loading"

// Mock data for notification rules
const notificationRules = [
  {
    id: "rule-1",
    name: "Critical Alerts",
    description: "Send notifications for all critical alerts",
    severity: "critical",
    channels: ["email-1", "slack-1", "telegram-1"],
    status: "active",
  },
  {
    id: "rule-2",
    name: "High Severity Alerts",
    description: "Send notifications for high severity alerts",
    severity: "high",
    channels: ["email-1", "slack-1"],
    status: "active",
  },
  {
    id: "rule-3",
    name: "System Status Changes",
    description: "Notify when system status changes",
    severity: "all",
    channels: ["email-1", "discord-1"],
    status: "active",
  },
  {
    id: "rule-4",
    name: "After Hours Alerts",
    description: "Send all alerts during non-business hours",
    severity: "all",
    channels: ["telegram-1", "whatsapp-1"],
    status: "active",
  },
  {
    id: "rule-5",
    name: "Jira Ticket Creation",
    description: "Create Jira tickets for security incidents",
    severity: "high,critical",
    channels: ["webhook-1"],
    status: "active",
  },
]

// Helper function to get icon based on notification type
const getChannelIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "email":
      return Mail
    case "slack":
    case "discord":
      return MessageSquare
    case "telegram":
    case "whatsapp":
      return Smartphone
    default:
      return AlertCircle
  }
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("channels")
  const [isAddChannelModalOpen, setIsAddChannelModalOpen] = useState(false)
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null)
  const { channels, isLoading, error, fetchChannels, deleteChannel } = useNotificationState()

  // Fetch channels on component mount
  useEffect(() => {
    fetchChannels().catch(console.error)
  }, [fetchChannels])

  // Get channel name by ID - with safety checks
  const getChannelNameById = (id: string) => {
    if (!channels || channels.length === 0) return "Unknown"
    const channel = channels.find((c) => c?.notification_id === id)
    return channel ? channel.name : "Unknown"
  }

  // Count active channels safely
  const activeChannelsCount = channels?.filter((c) => c && c.enabled)?.length || 0

  const handleAddChannelSuccess = async (newChannel: NotificationChannel) => {
    setIsAddChannelModalOpen(false)
    // Refresh the channels list
    await fetchChannels()
  }

  const handleEditChannel = (channel: NotificationChannel) => {
    setSelectedChannel(channel)
    setIsEditChannelModalOpen(true)
  }

  const handleEditChannelSuccess = async (updatedChannel: NotificationChannel) => {
    setIsEditChannelModalOpen(false)
    setSelectedChannel(null)
    // Refresh the channels list
    await fetchChannels()
  }

  const handleDeleteChannel = (channel: NotificationChannel) => {
    setSelectedChannel(channel)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteChannel = async () => {
    if (selectedChannel?.notification_id) {
      try {
        await deleteChannel(selectedChannel.notification_id)
        setIsDeleteDialogOpen(false)
        setSelectedChannel(null)
      } catch (error) {
        
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Notification Management"
        description="Configure notification channels and delivery rules"
        actions={
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsAddChannelModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Channel
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Channels</CardDescription>
              <CardTitle className="text-2xl text-orange-500">{channels?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Bell className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-xs text-muted-foreground">{activeChannelsCount} active channels</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1d24] border-orange-600/20">
            <CardHeader className="pb-2">
              <CardDescription>Delivery Status</CardDescription>
              <CardTitle className="text-2xl text-green-500">Operational</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="channels" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1d24]">
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            <Card className="bg-[#0f1d24] border-orange-600/20">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loading />
                    <span className="ml-2 text-muted-foreground">Loading channels...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center p-8 text-red-500">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span>Error loading channels: {error}</span>
                  </div>
                ) : (
                  <>
                    {/* Mobile: Card/List layout */}
                    <div className="block md:hidden space-y-4">
                      {(!channels || channels.length === 0) ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No notification channels found. Click "Add Channel" to create one.
                        </div>
                      ) : (
                        channels.map((channel) => {
                          if (!channel) return null
                          const ChannelIcon = getChannelIcon(channel.notification_type || "")
                          return (
                            <div key={channel.notification_id} className="rounded-lg border border-orange-600/20 bg-[#0f1d24] p-4 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ChannelIcon className="h-4 w-4 text-orange-500" />
                                  <span className="font-medium text-base">{channel.name || "Unnamed Channel"}</span>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Channel
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteChannel(channel)}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Channel
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                <span><span className="text-muted-foreground">Type:</span> <span className="capitalize">{channel.notification_type || "Unknown"}</span></span>
                                <span><span className="text-muted-foreground">Target:</span> <span className="font-mono text-xs">{channel.channel || "N/A"}</span></span>
                                <span><span className="text-muted-foreground">Status:</span> <Badge variant="outline" className={channel.enabled ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>{channel.enabled ? "Active" : "Inactive"}</Badge></span>
                                <span><span className="text-muted-foreground">Client:</span> {channel.client || "N/A"}</span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                    {/* Desktop: Table layout */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Channel Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!channels || channels.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No notification channels found. Click "Add Channel" to create one.
                              </TableCell>
                            </TableRow>
                          ) : (
                            channels.map((channel) => {
                              if (!channel) return null // Skip undefined channels
                              const ChannelIcon = getChannelIcon(channel.notification_type || "")
                              return (
                                <TableRow key={channel.notification_id}>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <ChannelIcon className="h-4 w-4 mr-2 text-orange-500" />
                                      <span className="font-medium">{channel.name || "Unnamed Channel"}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="capitalize">{channel.notification_type || "Unknown"}</TableCell>
                                  <TableCell className="font-mono text-xs">{channel.channel || "N/A"}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        channel.enabled
                                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                                          : "bg-red-500/10 text-red-500 border-red-500/20"
                                      }
                                    >
                                      {channel.enabled ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{channel.client || "N/A"}</TableCell>
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
                                        <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Channel
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteChannel(channel)}>
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Channel
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Channel Modal */}
      <AddChannelModal
        isOpen={isAddChannelModalOpen}
        onClose={() => setIsAddChannelModalOpen(false)}
        onSuccess={handleAddChannelSuccess}
      />

      {/* Edit Channel Modal */}
      <EditChannelModal
        isOpen={isEditChannelModalOpen}
        onClose={() => setIsEditChannelModalOpen(false)}
        onSuccess={handleEditChannelSuccess}
        channel={selectedChannel}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0f1d24] border-orange-600/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the channel "{selectedChannel?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChannel} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
