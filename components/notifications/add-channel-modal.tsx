"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Bell, Check, Link, MessageSquare, Mail, Loader2 } from "lucide-react"
import type { NotificationChannel } from "@/lib/services/notificationService"
import { useNotificationState } from "@/lib/state/notificationState/notificationState"

interface AddChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (channel: NotificationChannel) => void
}

export function AddChannelModal({ isOpen, onClose, onSuccess }: AddChannelModalProps) {
  const [name, setName] = useState("")
  const [notificationType, setNotificationType] = useState("slack")
  const [channel, setChannel] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [client, setClient] = useState("soli")
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { addChannel, isLoading } = useNotificationState()

  const getChannelLabel = () => {
    switch (notificationType) {
      case "slack":
        return "Slack Channel"
      case "email":
        return "Email Address"
      case "discord":
        return "Discord Channel"
      case "telegram":
        return "Telegram Chat ID"
      case "whatsapp":
        return "WhatsApp Group"
      default:
        return "Channel"
    }
  }

  const getChannelPlaceholder = () => {
    switch (notificationType) {
      case "slack":
        return "#security-alerts"
      case "email":
        return "security-team@company.com"
      case "discord":
        return "#security-alerts"
      case "telegram":
        return "Security Team"
      case "whatsapp":
        return "Security Team Group"
      default:
        return "Enter channel"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name || !channel || !webhookUrl) {
      setError("Please fill in all required fields")
      return
    }

    try {
      const newChannel: NotificationChannel = {
        name,
        notification_type: notificationType,
        channel,
        webhook_url: webhookUrl,
        client,
        enabled,
      }

      const result = await addChannel(newChannel)
      setSuccess(true)

      // Reset form
      setName("")
      setChannel("")
      setWebhookUrl("")
      setEnabled(false)

      // Notify parent component
      onSuccess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add notification channel")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f1d24] border border-orange-600/20 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Add Notification Channel</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded flex items-center text-green-500">
              <Check className="h-4 w-4 mr-2" />
              Channel added successfully!
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
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
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
                    Adding...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Add Channel
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
