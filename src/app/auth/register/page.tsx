'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, User, Mail, KeyRound, ArrowRight, Eye, EyeOff,
  CheckCircle2, GraduationCap, Users, Loader2, School, Search,
  PlusCircle, X, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

type RegisterRole = 'STUDENT' | 'TEACHER'

interface SchoolOption {
  id: string
  name: string
  city: string | null
  emirate: string | null
}

const ROLES: { value: RegisterRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'STUDENT', label: 'Student / Delegate', icon: Users, desc: 'Join conferences, train, and compete' },
  { value: 'TEACHER', label: 'Teacher / MUN Advisor', icon: GraduationCap, desc: 'Guide students and manage programs' },
]

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('STUDENT')
  const [schoolId, setSchoolId] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [customSchoolName, setCustomSchoolName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // School search state
  const [schools, setSchools] = useState<SchoolOption[]>([])
  const [schoolSearch, setSchoolSearch] = useState('')
  const [schoolsLoading, setSchoolsLoading] = useState(false)
  const [isOtherSchool, setIsOtherSchool] = useState(false)

  // Request school addition state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [requestSchoolName, setRequestSchoolName] = useState('')
  const [requestSchoolCity, setRequestSchoolCity] = useState('')
  const [requestSchoolEmirate, setRequestSchoolEmirate] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  // Fetch schools from API
  const fetchSchools = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSchools([])
      return
    }
    setSchoolsLoading(true)
    try {
      const res = await fetch(`/api/schools?q=${encodeURIComponent(query)}&limit=30&isVerified=true`)
      if (res.ok) {
        const data = await res.json()
        setSchools(data.schools || [])
      }
    } catch {
      // Silently fail
    } finally {
      setSchoolsLoading(false)
    }
  }, [])

  // Debounced school search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (schoolSearch && !isOtherSchool) {
        fetchSchools(schoolSearch)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [schoolSearch, fetchSchools, isOtherSchool])

  const handleSchoolSelect = (value: string) => {
    if (value === '__other__') {
      setIsOtherSchool(true)
      setSchoolId('')
      setSchoolName('')
      setCustomSchoolName('')
    } else {
      setIsOtherSchool(false)
      const selected = schools.find(s => s.id === value)
      setSchoolId(value)
      setSchoolName(selected?.name || '')
      setCustomSchoolName('')
    }
  }

  const handleResetSchoolSelection = () => {
    setIsOtherSchool(false)
    setSchoolId('')
    setSchoolName('')
    setCustomSchoolName('')
    setSchoolSearch('')
  }

  const handleRequestSchoolAddition = async () => {
    if (!requestSchoolName.trim()) return
    setRequestSubmitting(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestSchoolName.trim(),
          city: requestSchoolCity || 'Unknown',
          emirate: requestSchoolEmirate || undefined,
          country: 'UAE',
          source: 'SELF_REGISTERED',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setRequestSuccess(true)
        // Auto-select the newly created school
        setSchoolId(data.school?.id || '')
        setSchoolName(requestSchoolName.trim())
        setIsOtherSchool(false)
        setCustomSchoolName('')
        setTimeout(() => {
          setRequestDialogOpen(false)
          setRequestSuccess(false)
          setRequestSchoolName('')
          setRequestSchoolCity('')
          setRequestSchoolEmirate('')
        }, 2000)
      }
    } catch {
      // Silently fail
    } finally {
      setRequestSubmitting(false)
    }
  }

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
      const requestBody: Record<string, string> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      }

      if (isOtherSchool && customSchoolName.trim()) {
        requestBody.schoolName = customSchoolName.trim()
      } else if (schoolId) {
        requestBody.schoolId = schoolId
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const result = await res.json()

      if (res.ok && result?.user) {
        // Auto-login after registration using next-auth/react signIn() (handles CSRF)
        try {
          const { signIn: authSignIn } = await import('next-auth/react')
          const loginResult = await authSignIn('credentials', {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
          })

          if (loginResult?.ok) {
            router.push('/dashboard')
            return
          }
        } catch {
          // Auto-login failed, redirect to sign-in page
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

              {/* School Selection */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">School <span className="text-white/30">(optional)</span></Label>

                <AnimatePresence mode="wait">
                  {isOtherSchool ? (
                    <motion.div
                      key="custom-school"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <Input
                            placeholder="Type your school name"
                            value={customSchoolName}
                            onChange={(e) => setCustomSchoolName(e.target.value)}
                            className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleResetSchoolSelection}
                          className="shrink-0 text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequestDialogOpen(true)}
                        className="flex items-center gap-1.5 text-xs text-[#D4A843] hover:text-[#E0BC6A] transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Request school addition to our directory
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="school-select"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                        <Input
                          placeholder="Search for your school..."
                          value={schoolSearch}
                          onChange={(e) => {
                            setSchoolSearch(e.target.value)
                            setSchoolId('')
                            setSchoolName('')
                          }}
                          className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                        />
                        {schoolsLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
                        )}
                      </div>

                      {/* Selected school display */}
                      {schoolId && schoolName && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
                          <School className="w-4 h-4 text-[#D4A843] shrink-0" />
                          <span className="text-sm text-[#D4A843] flex-1 truncate">{schoolName}</span>
                          <button
                            type="button"
                            onClick={handleResetSchoolSelection}
                            className="text-white/30 hover:text-white/60 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* School search results */}
                      {schoolSearch && !schoolId && (
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0D1B2A]/90 backdrop-blur-sm">
                          {schools.length > 0 ? (
                            schools.map((school) => (
                              <button
                                key={school.id}
                                type="button"
                                onClick={() => {
                                  setSchoolId(school.id)
                                  setSchoolName(school.name)
                                  setSchoolSearch(school.name)
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-b-0"
                              >
                                <div className="text-sm text-white/80">{school.name}</div>
                                {school.city && (
                                  <div className="text-xs text-white/35">
                                    {school.city}{school.emirate ? `, ${school.emirate}` : ''}
                                  </div>
                                )}
                              </button>
                            ))
                          ) : (
                            !schoolsLoading && (
                              <div className="px-3 py-4 text-center text-sm text-white/30">
                                No schools found matching &quot;{schoolSearch}&quot;
                              </div>
                            )
                          )}

                          {/* Other School option */}
                          <button
                            type="button"
                            onClick={() => handleSchoolSelect('__other__')}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#D4A843]/10 transition-colors border-t border-[#D4A843]/20"
                          >
                            <div className="flex items-center gap-2">
                              <PlusCircle className="w-4 h-4 text-[#D4A843]" />
                              <div>
                                <div className="text-sm text-[#D4A843]">Other School</div>
                                <div className="text-xs text-white/35">Can&apos;t find your school? Enter it manually</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}

                      {!schoolSearch && !schoolId && (
                        <div
                          onClick={() => handleSchoolSelect('__other__')}
                          className="flex items-center gap-2 text-xs text-[#D4A843]/70 hover:text-[#D4A843] cursor-pointer transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Can&apos;t find your school? Click here to add it manually
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  <>Start 24-Hour Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>
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
                By creating an account, you agree to our Terms of Service and Privacy Policy. Your 24-hour free trial includes restricted access to basic courses and limited assessments only.
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      {/* Request School Addition Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="bg-[#1B3A4B] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <School className="w-5 h-5 text-[#D4A843]" />
              Request School Addition
            </DialogTitle>
          </DialogHeader>

          {requestSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white/80 font-medium">School Submitted Successfully!</p>
              <p className="text-white/40 text-sm mt-1">
                It will be reviewed and added to our directory within 1-3 business days.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/50 text-sm">
                Submit your school for inclusion in our directory. We&apos;ll review and add it within 1-3 business days.
              </p>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">School Name *</Label>
                <Input
                  placeholder="Enter school name"
                  value={requestSchoolName}
                  onChange={(e) => setRequestSchoolName(e.target.value)}
                  className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">City</Label>
                <Input
                  placeholder="e.g., Dubai, Abu Dhabi, Sharjah"
                  value={requestSchoolCity}
                  onChange={(e) => setRequestSchoolCity(e.target.value)}
                  className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Emirate</Label>
                <Select value={requestSchoolEmirate} onValueChange={setRequestSchoolEmirate}>
                  <SelectTrigger className="bg-white/[0.06] border-white/[0.08] text-white focus:ring-[#D4A843]/20">
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B3A4B] border-white/10">
                    <SelectItem value="Abu Dhabi" className="text-white/80 focus:bg-white/10 focus:text-white">Abu Dhabi</SelectItem>
                    <SelectItem value="Dubai" className="text-white/80 focus:bg-white/10 focus:text-white">Dubai</SelectItem>
                    <SelectItem value="Sharjah" className="text-white/80 focus:bg-white/10 focus:text-white">Sharjah</SelectItem>
                    <SelectItem value="Ajman" className="text-white/80 focus:bg-white/10 focus:text-white">Ajman</SelectItem>
                    <SelectItem value="Ras Al Khaimah" className="text-white/80 focus:bg-white/10 focus:text-white">Ras Al Khaimah</SelectItem>
                    <SelectItem value="Fujairah" className="text-white/80 focus:bg-white/10 focus:text-white">Fujairah</SelectItem>
                    <SelectItem value="Umm Al Quwain" className="text-white/80 focus:bg-white/10 focus:text-white">Umm Al Quwain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRequestDialogOpen(false)}
                  className="flex-1 text-white/50 hover:text-white hover:bg-white/[0.06]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRequestSchoolAddition}
                  disabled={!requestSchoolName.trim() || requestSubmitting}
                  className="flex-1 bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold"
                >
                  {requestSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
