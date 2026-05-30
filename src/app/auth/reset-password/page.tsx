'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Globe, KeyRound, ArrowRight, Eye, EyeOff, Loader2,
  CheckCircle2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
      setIsValidating(false)
      return
    }
    // Token is present — we'll validate on form submit
    setTokenValid(true)
    setIsValidating(false)
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const result = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(result?.error || 'Failed to reset password. Please try again.')
      }
    } catch {
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    )
  }

  // Invalid token state
  if (!tokenValid && error) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A843]/[0.07] rounded-full" />
        </div>
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
              <Globe className="w-6 h-6 text-[#0D1B2A]" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Diplomati<span className="text-[#D4A843]">Q</span>
            </span>
          </div>

          <Card className="bg-white/[0.06] border-white/[0.08] backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
              <p className="text-white/45 text-sm mb-6">{error}</p>
              <Link href="/auth/forgot-password">
                <Button className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold">
                  Request New Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0A7E8C] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A843]/[0.07] rounded-full" />
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
          {success ? (
            <>
              <CardHeader className="text-center pb-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <CardTitle className="text-2xl text-white">Password Reset</CardTitle>
                <CardDescription className="text-white/45">
                  Your password has been successfully reset. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-col pb-6">
                <Button
                  className="w-full bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold h-11"
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl text-white">Set New Password</CardTitle>
                <CardDescription className="text-white/45">
                  Choose a strong password for your account
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

                {/* New Password */}
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder="Min. 8 characters, 1 uppercase, 1 number"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">Confirm New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      placeholder="Confirm your new password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pl-10 pr-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passwords match
                    </div>
                  )}
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
                    <>Reset Password <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </CardContent>

              <CardFooter className="pb-6">
                <Link
                  href="/auth/signin"
                  className="text-sm text-[#0A7E8C] hover:text-[#0A9EAC] transition-colors"
                >
                  Back to Sign In
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A843]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
