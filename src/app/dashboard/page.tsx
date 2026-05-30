'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AppShell from '@/components/dashboard/AppShell'
import { useAuthStore, useNavStore } from '@/lib/store'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { user, isAuthenticated, checkSession } = useAuthStore()
  const { navigate } = useNavStore()
  const [sessionChecked, setSessionChecked] = useState(false)

  // Check session on mount
  useEffect(() => {
    const init = async () => {
      await checkSession()
      setSessionChecked(true)
    }
    init()
  }, [checkSession])

  // Set dashboard view on mount
  useEffect(() => {
    navigate('dashboard')
  }, [navigate])

  // Redirect to login only after session check completes and user is not authenticated
  useEffect(() => {
    if (sessionChecked && !isAuthenticated && sessionStatus !== 'loading') {
      router.push('/auth/signin?callbackUrl=/dashboard')
    }
  }, [sessionChecked, isAuthenticated, sessionStatus, router])

  // Loading state — show while session is being checked
  if (!sessionChecked || sessionStatus === 'loading' || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-[#0D1B2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return <AppShell />
}
