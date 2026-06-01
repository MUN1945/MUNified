'use client'

import React from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/lib/i18n'

export default function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { locale, setLocale } = useI18n()

  const label = locale === 'ar' ? 'عربي' : 'EN'

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-sm font-medium px-2"
        onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{label}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
          <Globe className="w-4 h-4" />
          <span>{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={locale === 'en' ? 'bg-[#0D7377]/5 text-[#0D7377] font-medium' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('ar')}
          className={locale === 'ar' ? 'bg-[#0D7377]/5 text-[#0D7377] font-medium' : ''}
        >
          🇸🇦 العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
