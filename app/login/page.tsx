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
import { ThemedLogo } from "@/components/ThemedLogo"
import { useTheme } from "next-themes"
import Link from "next/link"

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
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "#0E1A1F" : "#E8E8E8";
  const cardColor = theme === "dark" ? "#142A33" : "#fff";
  const borderColor = "#EA661B";

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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0E1A1F", fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div
        className="w-full max-w-md flex flex-col items-stretch"
        style={{
          background: "#142A33",
          border: "1px solid #EA661B",
          borderRadius: 12,
          padding: '2.5rem 2rem 2rem 2rem',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex justify-center mb-8">
          <ThemedLogo width={173} height={58} style={{ color: "#EA661B" }} />
        </div>
        <h1 className="text-[23px] font-bold mb-1 text-left" style={{ color: "#EA661B" }}>Affinity</h1>
        <div className="mb-8 text-left text-sm" style={{ color: "#506C77" }}>
          / enter your credentials to access your account
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            id="email"
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-black text-white rounded-none outline-none focus:ring-0 focus:outline-none"
            required
            autoComplete="username"
            style={{ border: 'none' }}
          />
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-black text-white rounded-none outline-none focus:ring-0 focus:outline-none"
              required
              autoComplete="current-password"
              style={{ border: 'none' }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-[#EA661B] text-white text-center font-semibold rounded-none"
            disabled={isLoading}
            style={{ fontSize: 16 }}
          >
            {isLoading ? <Loading className="mr-2" /> : "Login"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link href="#" className="text-gray-200 no-underline hover:underline">Forgot password?</Link>
          <Link href="#" className="text-gray-200 no-underline hover:underline">Contact support</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
