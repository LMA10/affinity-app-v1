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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isAuthenticated, login, isLoading: authLoading } = useAuth()

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/alerts-view")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!email || !password) {
      setIsLoading(false)
      return
    }

    const success = await login(email, password)

    if (success) {
      router.push("/alerts-view")
    }

    setIsLoading(false)
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1419]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1419] p-4">
      <div className="absolute top-8 left-8">
        <Image src="/soli-logo.png" alt="AFFINITY Logo" width={180} height={60} priority />
      </div>

      <Card className="w-full max-w-md border-orange-600/20 bg-[#0f1d24]/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-500">Login to AFFINITY</CardTitle>
          <CardDescription>Enter your credentials to access your security dashboard</CardDescription>
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
                  className="pl-10"
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {/* <Button variant="link" className="px-0 text-xs text-muted-foreground">
            Forgot password?
          </Button>
          <Button variant="link" className="px-0 text-xs text-muted-foreground">
            Contact support
          </Button>
          */}
        </CardFooter>
      </Card>
    </div>
  )
}
