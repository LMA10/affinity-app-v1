"use client"

import type React from "react"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Mail, Lock } from "lucide-react"
import userState from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [step, setStep] = useState<"details" | "confirmation">("details")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("") // Keep this for backend compatibility
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { loading } = useSnapshot(userState)

  const resetForm = () => {
    setEmail("")
    setUsername("")
    setPassword("")
    setConfirmPassword("")
    setConfirmationCode("")
    setError(null)
    setSuccess(null)
    setStep("details")
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required")
      return false
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (step === "details") {
      if (!validateForm()) return

      // Set username to email value for backend compatibility
      setUsername(email)

      setIsSubmitting(true)
      try {
        await userState.register(email, password, false) // Always false for admin flag
        setSuccess("User registered successfully. Please check email for confirmation code.")
        setStep("confirmation")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to register user")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Handle confirmation step
      if (!confirmationCode) {
        setError("Confirmation code is required")
        return
      }

      setIsSubmitting(true)
      try {
        await userState.confirmRegistration(email, confirmationCode)
        setSuccess("User confirmed successfully!")
        setTimeout(() => {
          handleClose()
          if (onSuccess) onSuccess()
        }, 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to confirm user")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "details" ? "Add New User" : "Confirm User"}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 border-green-900/50 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === "details" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setUsername(e.target.value) // Set username to email value
                  }}
                  placeholder="name@company.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="pl-10"
                />
              </div>
            </div>
          </>
        ) : (
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
        )}

        <div className="flex justify-between space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === "details" ? "Registering..." : "Confirming..."}
              </>
            ) : step === "details" ? (
              "Register User"
            ) : (
              "Confirm User"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
