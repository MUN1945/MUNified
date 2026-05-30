'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Globe, Mail, KeyRound, ArrowRight, Eye, EyeOff, Check, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: 'Invalid email or password. Please try again.',
        SessionRequired: 'Please sign in to access this page.',
        OAuthAccountNotLinked: 'An account with this email already exists. Please sign in with your original method.',
        Default: 'An error occurred during sign in. Please try again.',
      }
      setError(errorMessages[errorParam] || errorMessages.Default)
    }
  }, [errorParam])

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null)
    setOauthLoading(provider)
    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      })
      if (result?.error) {
        setError(result.error === 'OAuthAccountNotLinked'
          ? 'An account with this email already exists. Please sign in with your original method.'
          : 'An error occurred during sign in. Please try again.'
        )
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch {
      setError('Unable to connect to the authentication provider. Please try again.')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      // Use next-auth/react signIn() which handles CSRF tokens automatically
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin'
          ? 'Invalid email or password. Please try again.'
          : result.error
        )
      } else if (result?.ok) {
        router.push(callbackUrl)
      } else {
        setError('Invalid email or password. Please try again.')
      }
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

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/[0.06] border-white/[0.12] text-white hover:bg-white/[0.12] hover:border-white/[0.2] h-11 font-medium transition-all"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn('google')}
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white/[0.06] border-white/[0.12] text-white hover:bg-white/[0.12] hover:border-white/[0.2] h-11 font-medium transition-all"
                  disabled={oauthLoading !== null || isLoading}
                  onClick={() => handleOAuthSignIn('github')}
                >
                  {oauthLoading === 'github' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Continue with GitHub
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-white/[0.08]" />
                <span className="mx-3 text-xs text-white/30 uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-white/[0.08]" />
              </div>

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
                disabled={isLoading || oauthLoading !== null}
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
