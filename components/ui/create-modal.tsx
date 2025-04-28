"use client"

import type React from "react"

import { type ReactNode, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export interface Step {
  id: string
  title: string
  content: ReactNode
}

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  steps: Step[]
  onSubmit: (currentStep: string, goToNextStep: () => void, complete: () => void) => Promise<void>
  submitButtonText?: string | ((stepId: string) => string)
  size?: "sm" | "md" | "lg" | "xl"
}

export function CreateModal({
  isOpen,
  onClose,
  title,
  steps,
  onSubmit,
  submitButtonText = "Submit",
  size = "md",
}: CreateModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  const handleClose = () => {
    setCurrentStepIndex(0)
    setError(null)
    setSuccess(null)
    onClose()
  }

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
      setError(null)
      setSuccess(null)
    }
  }

  const complete = () => {
    setSuccess("Operation completed successfully!")
    setTimeout(handleClose, 1500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(currentStep.id, goToNextStep, complete)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSubmitButtonText = () => {
    if (typeof submitButtonText === "function") {
      return submitButtonText(currentStep.id)
    }
    return submitButtonText
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${title}: ${currentStep.title}`} size={size}>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {currentStep.content}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              getSubmitButtonText()
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
