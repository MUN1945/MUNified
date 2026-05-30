'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Globe, User, Mail, KeyRound, ArrowRight, Eye, EyeOff,
  CheckCircle2, GraduationCap, Users, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

type RegisterRole = 'STUDENT' | 'TEACHER'

const ROLES: { value: RegisterRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'STUDENT', label: 'Student / Delegate', icon: Users, desc: 'Join conferences, train, and compete' },
  { value: 'TEACHER', label: 'Teacher / MUN Advisor', icon: GraduationCap, desc: 'Guide students and manage programs' },
]

const SCHOOLS = [
  'American School of Dubai',
  'American School of Abu Dhabi',
  'GEMS Wellington International School',
  'GEMS Modern Academy',
  'Dubai International Academy',
  'Jumeirah College',
  'Repton School Dubai',
  'Raha International School',
  'Brighton College Abu Dhabi',
  'Cranleigh Abu Dhabi',
  'Other',
]

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('STUDENT')
  const [school, setSchool] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required'
    if (!email.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          school: school || undefined,
        }),
      })

      const result = await res.json()

      if (res.ok && result?.user) {
        // Auto-login after registration
        const loginRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email: email.trim().toLowerCase(), password }),
        })

        if (loginRes.ok) {
          router.push('/dashboard')
          return
        }

        // If auto-login fails, redirect to sign-in
        router.push('/auth/signin')
        return
      }

      setError(result?.error || 'Registration failed. Please try again.')
    } catch {
      setError('Unable to connect to server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0A7E8C] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A843]/[0.07] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D4A843]/[0.04] rounded-full" />
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
              <CardTitle className="text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="text-white/45">
                Begin your diplomatic journey
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

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Email *</Label>
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
                <Label className="text-white/70 text-sm">Password *</Label>
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
                <Label className="text-white/70 text-sm">Confirm Password *</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    placeholder="Confirm your password"
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

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-white/70 text-sm">I am a... *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        role === r.value
                          ? 'border-[#D4A843]/50 bg-[#D4A843]/10'
                          : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <r.icon className={`w-5 h-5 ${role === r.value ? 'text-[#D4A843]' : 'text-white/40'}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${role === r.value ? 'text-[#D4A843]' : 'text-white/70'}`}>
                          {r.label}
                        </div>
                        <div className="text-xs text-white/40">{r.desc}</div>
                      </div>
                      {role === r.value && <CheckCircle2 className="w-4 h-4 text-[#D4A843] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* School (optional) */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">School <span className="text-white/30">(optional)</span></Label>
                <Select value={school} onValueChange={setSchool}>
                  <SelectTrigger className="bg-white/[0.06] border-white/[0.08] text-white focus:ring-[#D4A843]/20">
                    <SelectValue placeholder="Select your school" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B3A4B] border-white/10">
                    {SCHOOLS.map((s) => (
                      <SelectItem key={s} value={s} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <>Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex-col gap-4 pb-6">
              <div className="text-center text-sm text-white/40">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="text-[#D4A843] hover:text-[#E0BC6A] transition-colors font-medium"
                >
                  Sign in
                </Link>
              </div>

              <div className="text-center text-xs text-white/25">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
