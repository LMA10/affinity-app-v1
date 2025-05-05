"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { toast } from "@/hooks/use-toast"
import { Loading } from "@/components/loading"
import { ThemeToggle } from "@/components/theme-toggle"
import usersState from "@/lib/state/userState/userState"
import { useSnapshot } from "valtio"
import { Modal } from "@/components/ui/modal"
import { Button as UIButton } from "@/components/ui/button"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth()
  const { error: loginError } = useSnapshot(usersState)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmError, setConfirmError] = useState("")

  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      router.replace("/alerts-view")
    }
  }, [isAuthenticated, authIsLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email || !password) {
      setIsLoading(false)
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    const success = await login(email, password)
    const statusCode = usersState.loginMessage?.statusCode

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back! Redirecting...",
      })
      router.push("/alerts-view")
      setIsLoading(false)
      return
    }
    if (statusCode === 202) {
      setShowConfirmModal(true)
      setIsLoading(false)
      return
    }
    toast({
      title: "Login failed",
      description: loginError,
      variant: "destructive",
    })
    setIsLoading(false)
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmLoading(true)
    setConfirmError("")
    try {
      await usersState.confirmRegistration(email, confirmationCode)
      toast({
        title: "User confirmed!",
        description: "You can now access your account.",
      })
      setShowConfirmModal(false)
      router.push("/alerts-view")
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Failed to confirm user")
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute top-8 left-8">
        <Image src="/soli-logo.png" alt="AFFINITY Logo" width={180} height={60} priority />
      </div>
      <Card className="w-full max-w-md border bg-white dark:bg-[#0f1d24] border-gray-200 dark:border-orange-600/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-500">AFFINITY</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border border-gray-200 dark:border-orange-600/20 text-foreground placeholder:text-muted-foreground"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background border border-gray-200 dark:border-orange-600/20 text-foreground placeholder:text-muted-foreground"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? <Loading className="mr-2" /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Account"
      >
        <form onSubmit={handleConfirm} className="space-y-4">
          <Label htmlFor="confirmationCode">Confirmation Code</Label>
          <Input
            id="confirmationCode"
            value={confirmationCode}
            onChange={e => setConfirmationCode(e.target.value)}
            placeholder="Enter confirmation code sent to email"
            autoFocus
          />
          {confirmError && <div className="text-red-500 text-sm">{confirmError}</div>}
          <UIButton type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={confirmLoading}>
            {confirmLoading ? "Confirming..." : "Confirm"}
          </UIButton>
        </form>
      </Modal>
    </div>
  )
}

export default LoginPage
