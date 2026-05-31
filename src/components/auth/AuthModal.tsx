'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, User, Mail, KeyRound, ArrowRight, CheckCircle2,
  GraduationCap, Building2, Gavel, Users, Sparkles, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore, type UserRole } from '@/lib/store'

const ROLES: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'STUDENT', label: 'Student / Delegate', icon: Users, desc: 'Join conferences, train, and compete' },
  { value: 'TEACHER', label: 'Teacher / MUN Advisor', icon: GraduationCap, desc: 'Guide students and manage programs' },
  { value: 'ADMIN', label: 'Administrator', icon: Building2, desc: 'Oversee school MUN programs' },
  { value: 'SCHOOL_ADMIN', label: 'Secretariat', icon: Gavel, desc: 'Organize and run conferences' },
]

export default function AuthModal() {
  const { login, register, isLoading, error, clearError } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [school, setSchool] = useState('')
  const [country, setCountry] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLocalError(null)
    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }
    await login(email, password)
  }

  const handleRegister = async () => {
    setLocalError(null)
    if (!name || !email || !password) {
      setLocalError('Please fill in all required fields')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    await register({ name, email, password, role: selectedRole, school, country })
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen navy-gradient text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0D7377] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#D4A843]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D4A843]/5 rounded-full" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#D4A843]/30 rounded-full"
            style={{
              top: `${50 + 35 * Math.sin((i / 8) * Math.PI * 2)}%`,
              left: `${50 + 35 * Math.cos((i / 8) * Math.PI * 2)}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
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
          <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center">
            <Globe className="w-6 h-6 text-[#1B3A4B]" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Diplomati<span className="text-[#D4A843]">Q</span>
          </span>
        </div>

        <Card className="bg-white/[0.07] border-white/10 backdrop-blur-xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setLocalError(null); clearError() }}>
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/[0.06]">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white text-white/60">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white text-white/60">
                  Register
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                transition={{ duration: 0.25 }}
              >
                <TabsContent value="login" className="mt-0">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-white/50">Sign in to continue your diplomatic journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Password</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          placeholder="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {displayError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                      >
                        {displayError}
                      </motion.div>
                    )}

                    <Button
                      className="w-full bg-[#0D7377] text-white hover:bg-[#0F8A8F] font-semibold h-11"
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>


                  </CardContent>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl text-white">Create Account</CardTitle>
                    <CardDescription className="text-white/50">Begin your diplomatic journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70 text-sm">Password *</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                          placeholder="Min. 6 characters"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white/70 text-sm">I am a... *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role.value}
                            onClick={() => setSelectedRole(role.value)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              selectedRole === role.value
                                ? 'border-[#0D7377]/50 bg-[#0D7377]/15'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                          >
                            <role.icon className={`w-5 h-5 ${selectedRole === role.value ? 'text-[#0D7377]' : 'text-white/40'}`} />
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${selectedRole === role.value ? 'text-[#0D7377]' : 'text-white/70'}`}>
                                {role.label}
                              </div>
                              <div className="text-xs text-white/40">{role.desc}</div>
                            </div>
                            {selectedRole === role.value && <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">School</Label>
                        <Input
                          placeholder="School name"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          className="bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70 text-sm">Country</Label>
                        <Input
                          placeholder="Country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20"
                        />
                      </div>
                    </div>

                    {displayError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                      >
                        {displayError}
                      </motion.div>
                    )}

                    <Button
                      className="w-full bg-[#0D7377] text-white hover:bg-[#0F8A8F] font-semibold h-11"
                      onClick={handleRegister}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </CardContent>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <CardFooter className="flex-col gap-2 pb-6">
            <div className="flex items-center gap-2 text-white/30 text-sm">
              <Sparkles className="w-4 h-4 text-[#D4A843]" />
              <span>Join 2,000+ delegates worldwide</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
