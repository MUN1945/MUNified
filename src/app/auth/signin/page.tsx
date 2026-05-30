'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Globe, Mail, KeyRound, ArrowRight, Eye, EyeOff, Check, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: 'Invalid email or password. Please try again.',
        SessionRequired: 'Please sign in to access this page.',
        Default: 'An error occurred during sign in. Please try again.',
      }
      setError(errorMessages[errorParam] || errorMessages.Default)
    }
  }, [errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
      })

      if (res.ok) {
        // Verify session was created
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          if (session?.user) {
            router.push(callbackUrl)
            return
          }
        }
      }

      setError('Invalid email or password. Please try again.')
    } catch {
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0A7E8C] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A843]/[0.07] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D4A843]/[0.04] rounded-full" />
        {/* Subtle floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#D4A843]/30 rounded-full"
            style={{
              top: `${50 + 35 * Math.sin((i / 6) * Math.PI * 2)}%`,
              left: `${50 + 35 * Math.cos((i / 6) * Math.PI * 2)}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
            <Globe className="w-6 h-6 text-[#0D1B2A]" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Diplomati<span className="text-[#D4A843]">Q</span>
          </span>
        </div>

        <Card className="bg-white/[0.06] border-white/[0.08] backdrop-blur-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
              <CardDescription className="text-white/45">
                Sign in to continue your diplomatic journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  {error}
                </motion.div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-sm">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#0A7E8C] hover:text-[#0A9EAC] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-10 pr-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-[#D4A843] border-[#D4A843] text-[#0D1B2A]'
                      : 'border-white/20 bg-transparent'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3" />}
                </button>
                <span className="text-sm text-white/50">Remember me</span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold h-11 shadow-md shadow-[#D4A843]/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex-col gap-4 pb-6">
              <div className="text-center text-sm text-white/40">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="text-[#D4A843] hover:text-[#E0BC6A] transition-colors font-medium"
                >
                  Create one
                </Link>
              </div>

              <div className="flex items-center gap-2 text-white/25 text-xs">
                <Globe className="w-3.5 h-3.5 text-[#D4A843]/60" />
                <span>The Operating System for Model United Nations</span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
