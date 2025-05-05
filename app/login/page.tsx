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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
  const isDark = theme === "dark";
  const bgColor = isDark ? "#0E1A1F" : "#E8E8E8";
  const containerBg = isDark ? "#142A33" : "#CAD0D2";
  const borderColor = "#EA661B";
  const headingColor = isDark ? "#EA661B" : "#142A33";
  const subtitleColor = "#506C77";
  const logoColor = isDark ? "#EA661B" : "#142A33";
  const inputBg = isDark ? "#000" : "#B2BCC0";
  const inputText = isDark ? "#fff" : "#142A33";
  const buttonBg = "#EA661B";
  const buttonText = "#fff";
  const linkColor = isDark ? "#fff" : "#142A33";
  const helveticaBlack = 'Helvetica Black, Helvetica, Arial, sans-serif';
  const helveticaLight = 'Helvetica Light, Helvetica, Arial, sans-serif';
  const baseFontSize = 23;
  const containerPaddingY = 25;
  const containerPaddingX = 64;
  const marginY = 20;
  const subtitleInputSpacing = 16;
  const inputButtonSpacing = 11;
  const buttonLinksSpacing = 16;

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
    <div>
      {!mounted ? (
        <div />
      ) : (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: bgColor, fontFamily: helveticaLight, fontSize: baseFontSize, marginTop: marginY, marginBottom: marginY }}
        >
          <div className="absolute top-6 right-6 z-10">
            <ThemeToggle />
          </div>
          <div
            className="flex flex-col items-stretch"
            style={{
              background: containerBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
              padding: `${containerPaddingY}px ${containerPaddingX}px 2rem ${containerPaddingX}px`,
              boxSizing: 'border-box',
              minHeight: `calc(100vh - ${marginY * 2}px)`,
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              justifyContent: 'flex-start',
            }}
          >
            <div style={{ height: 45 - containerPaddingY }} />
            <div className="flex justify-center" style={{ marginBottom: 25 }}>
              <ThemedLogo width={173} height={58} style={{ color: logoColor }} />
            </div>
            <h1 className="mb-1 text-left" style={{ color: headingColor, fontFamily: helveticaBlack, fontWeight: 600, fontSize: baseFontSize }}>Affinity</h1>
            <div className="text-left" style={{ color: subtitleColor, fontFamily: helveticaLight, fontWeight: 300, fontSize: baseFontSize * 0.7, marginBottom: subtitleInputSpacing, lineHeight: '18px' }}>
              / enter your credentials to access your security dashboard
            </div>
            <form onSubmit={handleLogin} className="flex flex-col" style={{ gap: inputButtonSpacing }}>
              <input
                id="email"
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-none outline-none focus:ring-0 focus:outline-none"
                required
                autoComplete="username"
                style={{ border: 'none', background: inputBg, color: inputText, fontFamily: helveticaLight, fontWeight: 300, fontSize: baseFontSize * 0.8, marginBottom: inputButtonSpacing }}
              />
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-none outline-none focus:ring-0 focus:outline-none"
                  required
                  autoComplete="current-password"
                  style={{ border: 'none', background: inputBg, color: inputText, fontFamily: helveticaLight, fontWeight: 300, fontSize: baseFontSize * 0.8 }}
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
                className="w-full py-2 mt-2 text-center"
                disabled={isLoading}
                style={{
                  background: buttonBg,
                  color: buttonText,
                  fontFamily: helveticaBlack,
                  fontWeight: 400,
                  fontSize: baseFontSize * 0.8,
                  borderRadius: 10,
                  marginTop: inputButtonSpacing,
                  marginBottom: buttonLinksSpacing,
                }}
              >
                {isLoading ? <Loading className="mr-2" /> : "Entrar"}
              </button>
            </form>
            <div className="flex justify-between text-sm" style={{ color: linkColor, fontFamily: helveticaLight, fontWeight: 300 }}>
              <Link href="#" className="no-underline hover:underline">Forgot password?</Link>
              <Link href="#" className="no-underline hover:underline">Contact support</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
