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
  const borderColor = isDark ? "#EA661B" : "transparent";
  const headingColor = isDark ? "#EA661B" : "#142A33";
  const subtitleColor = "#506C77";
  const logoColor = isDark ? "#EA661B" : "#142A33";
  const inputBg = isDark ? "#0D1315" : "#B2BCC0";
  const inputText = "#506C77";
  const buttonBg = "#EA661B";
  const buttonText = "#fff";
  const linkColor = isDark ? "#fff" : "#142A33";
  const helvetica = 'Helvetica, Arial, sans-serif';
  const baseFontSize = 13;
  const containerPaddingY = 20;
  const containerPaddingX = 51;
  const marginY = 16;
  const elementSpacing = 9;
  const verticalGap = 13;
  const logoWidth = 138;
  const logoHeight = 46;
  const inputHeight = 35;
  const contentMaxWidth = 320;
  const borderRadius = 6;
  const iconColor = "#506C77";

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
          className="h-screen flex items-center justify-center"
          style={{ 
            background: bgColor, 
            fontFamily: helvetica, 
            fontSize: baseFontSize,
            overflow: 'hidden',
            padding: '25px 0',
            position: 'relative'
          }}
        >
          <div 
            className="absolute inset-y-0 left-0"
            style={{
              width: 'calc((50% + 300px) * 0.97)',
              background: isDark ? '#142A33' : '#CAD0D2',
              border: isDark ? '1px solid #EA661B' : 'none',
              zIndex: 0,
              left: '-50px',
              top: '-50px',
              height: 'calc(100% + 100px)'
            }}
          />
      <div className="absolute top-6 right-6 z-10">
            <div style={{ 
              border: isDark ? '1px solid #EA661B' : 'none',
              borderRadius: '6px',
              padding: '0px',
              stroke: isDark ? '#EA661B' : 'none',
              strokeWidth: '1px'
            }}>
        <ThemeToggle />
      </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow relative z-10">
            <div className="fixed top-[25px] left-1/2 -translate-x-1/2" style={{ width: contentMaxWidth, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
              <ThemedLogo width={logoWidth} height={logoHeight} style={{ color: logoColor, transform: 'scale(0.9)' }} />
        </div>
            <div style={{ 
              width: '100%', 
              maxWidth: contentMaxWidth,
              marginTop: -20
            }}>
              <h1 className="mb-1" style={{ color: headingColor, fontFamily: helvetica, fontWeight: 700, fontSize: baseFontSize }}>Affinity</h1>
              <div style={{ 
                color: subtitleColor, 
                fontFamily: helvetica, 
                fontWeight: 400, 
                fontSize: '12.3px', 
                marginBottom: verticalGap,
                lineHeight: '13px'
              }}>
                / enter your credentials to access your security dashboard
        </div>
              <form onSubmit={handleLogin} className="flex flex-col w-full" style={{ gap: elementSpacing }}>
          <input
            id="email"
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-[6px] outline-none focus:ring-0 focus:outline-none placeholder:text-[#506C77]"
            required
            autoComplete="username"
                  style={{ 
                    border: 'none', 
                    background: inputBg, 
                    color: email ? (isDark ? '#EA661B' : '#142A33') : '#506C77',
                    fontFamily: helvetica, 
                    fontWeight: 400, 
                    fontSize: baseFontSize,
                    height: `${inputHeight}px`,
                    WebkitTextFillColor: email ? (isDark ? '#EA661B' : '#142A33') : '#506C77',
                    WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
                    transition: 'background-color 5000s ease-in-out 0s'
                  }}
          />
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-[6px] outline-none focus:ring-0 focus:outline-none placeholder:text-[#506C77]"
              required
              autoComplete="current-password"
                    style={{ 
                      border: 'none', 
                      background: inputBg, 
                      color: password ? (isDark ? '#EA661B' : '#142A33') : '#506C77',
                      fontFamily: helvetica, 
                      fontWeight: 400, 
                      fontSize: baseFontSize,
                      height: `${inputHeight}px`,
                      WebkitTextFillColor: password ? (isDark ? '#EA661B' : '#142A33') : '#506C77',
                      WebkitBoxShadow: `0 0 0 1000px ${inputBg} inset`,
                      transition: 'background-color 5000s ease-in-out 0s'
                    }}
            />
            <button
              type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
                    style={{ color: iconColor }}
            >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
                  className="w-full text-center rounded-[6px] relative"
            disabled={isLoading}
                  style={{
                    background: (!email || !password) ? 'transparent' : buttonBg,
                    color: (!email || !password) ? '#506C77' : buttonText,
                    border: (!email || !password) ? '1px solid #506C77' : 'none',
                    fontFamily: helvetica,
                    fontWeight: 400,
                    fontSize: baseFontSize,
                    height: `${inputHeight}px`,
                    marginBottom: verticalGap
                  }}
          >
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : "Entrar"}
          </button>
        </form>
              <div className="flex justify-between w-full" style={{ 
                color: linkColor, 
                fontFamily: helvetica, 
                fontWeight: 400,
                fontSize: '12.3px' 
              }}>
                <Link href="#" className="no-underline hover:underline">Forgot password?</Link>
                <Link href="#" className="no-underline hover:underline">Contact support</Link>
              </div>
            </div>
            <a 
              href="https://solidaritylabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'fixed',
                bottom: '25px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: isDark ? '#EA661B' : '#142A33',
                fontFamily: helvetica,
                fontWeight: 400,
                fontSize: baseFontSize,
                textDecoration: 'none',
                textTransform: 'lowercase'
              }}
              className="after:content-[''] after:absolute after:w-0 after:h-[1px] after:bottom-0 after:left-0 after:transition-all after:duration-300 hover:after:w-full after:bg-[#142A33] dark:after:bg-[#EA661B]"
            >
              solidaritylabs.io/
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
