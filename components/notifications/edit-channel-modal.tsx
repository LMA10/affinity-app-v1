"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Bell, Check, Link, MessageSquare, Mail, Loader2 } from "lucide-react"
import type { NotificationChannel } from "@/lib/services/notificationService"
import { useNotificationState } from "@/lib/state/notificationState/notificationState"

interface EditChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (channel: NotificationChannel) => void
  channel: NotificationChannel | null
}

export function EditChannelModal({ isOpen, onClose, onSuccess, channel }: EditChannelModalProps) {
  const [name, setName] = useState("")
  const [notificationType, setNotificationType] = useState("slack")
  const [channelName, setChannelName] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [client, setClient] = useState("soli")
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { updateChannel, isLoading } = useNotificationState()

  // Load channel data when the modal opens or channel changes
  useEffect(() => {
    if (channel) {
      setName(channel.name || "")
      setNotificationType(channel.notification_type || "slack")
      setChannelName(channel.channel || "")
      setWebhookUrl(channel.webhook_url || "")
      setClient(channel.client || "soli")
      setEnabled(channel.enabled || false)
    }
  }, [channel])

  const getChannelLabel = () => {
    switch (notificationType) {
      case "slack":
        return "Slack Channel"
      case "discord":
        return "Discord Channel"
      case "telegram":
        return "Telegram Chat ID"
      default:
        return "Channel"
    }
  }

  const getChannelPlaceholder = () => {
    switch (notificationType) {
      case "slack":
        return "#security-alerts"
      case "discord":
        return "#security-alerts"
      case "telegram":
        return "Security Team"
      default:
        return "Enter channel"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name || !channelName || !webhookUrl) {
      setError("Please fill in all required fields")
      return
    }

    if (!channel?.notification_id) {
      setError("Channel ID is missing")
      return
    }

    try {
      const updatedChannel: NotificationChannel = {
        name,
        notification_type: notificationType,
        channel: channelName,
        webhook_url: webhookUrl,
        client,
        enabled,
      }

      const result = await updateChannel(channel.notification_id, updatedChannel)
      setSuccess(true)

      // Notify parent component
      onSuccess(result)

      // Close the modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notification channel")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f1d24] border border-orange-600/20 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Edit Notification Channel</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center text-green-500">
              <Check className="h-4 w-4 mr-2" />
              Channel updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Channel Name</Label>
                <div className="relative">
                  <Bell className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Security Alerts"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select value={notificationType} onValueChange={setNotificationType}>
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">{getChannelLabel()}</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="channel"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder={getChannelPlaceholder()}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="soli"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enable Channel</Label>
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Update Channel
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
