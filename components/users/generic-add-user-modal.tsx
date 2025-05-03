"use client"

import { useState } from "react"
import { CreateModal, type Step } from "@/components/ui/create-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import userState from "@/lib/state/userState/userState"
import { Eye, EyeOff } from "lucide-react"

interface GenericAddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function GenericAddUserModal({ isOpen, onClose, onSuccess }: GenericAddUserModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [deliveryDetails, setDeliveryDetails] = useState<{ destination: string; medium: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (stepId: string, goToNextStep: () => void, complete: () => void) => {
    if (stepId === "details") {
      // Validate form
      if (!email || !password || !confirmPassword) {
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
      const response = await userState.register(email, password)
      if (response?.body?.response?.CodeDeliveryDetails) {
        setDeliveryDetails({
          destination: response.body.response.CodeDeliveryDetails.Destination,
          medium: response.body.response.CodeDeliveryDetails.DeliveryMedium,
        })
      } else {
        setDeliveryDetails(null)
      }
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
          {deliveryDetails && (
            <p className="text-xs text-muted-foreground">
              A confirmation code has been sent to {deliveryDetails.destination} via {deliveryDetails.medium}. Please check your email and enter the code above.
            </p>
          )}
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
