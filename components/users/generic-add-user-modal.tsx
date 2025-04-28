"use client"

import { useState } from "react"
import { CreateModal, type Step } from "@/components/ui/create-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import userState from "@/lib/state/userState/userState"

interface GenericAddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function GenericAddUserModal({ isOpen, onClose, onSuccess }: GenericAddUserModalProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = async (stepId: string, goToNextStep: () => void, complete: () => void) => {
    if (stepId === "details") {
      // Validate form
      if (!email || !username || !password || !confirmPassword) {
        throw new Error("All fields are required")
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      // Register user
      await userState.register(email, password, isAdmin)
      goToNextStep()
    } else if (stepId === "confirmation") {
      // Validate confirmation code
      if (!confirmationCode) {
        throw new Error("Confirmation code is required")
      }

      // Confirm registration
      await userState.confirmRegistration(email, confirmationCode)

      // Complete the process
      if (onSuccess) onSuccess()
      complete()
    }
  }

  const steps: Step[] = [
    {
      id: "details",
      title: "User Details",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="isAdmin" className="text-sm">
              Grant administrator privileges
            </Label>
          </div>
        </div>
      ),
    },
    {
      id: "confirmation",
      title: "Confirm Registration",
      content: (
        <div className="space-y-2">
          <Label htmlFor="confirmationCode">Confirmation Code</Label>
          <Input
            id="confirmationCode"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder="Enter confirmation code sent to email"
          />
          <p className="text-xs text-muted-foreground">
            A confirmation code has been sent to {email}. Please check your email and enter the code above.
          </p>
        </div>
      ),
    },
  ]

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      steps={steps}
      onSubmit={handleSubmit}
      submitButtonText={(stepId) => (stepId === "details" ? "Register User" : "Confirm User")}
    />
  )
}
