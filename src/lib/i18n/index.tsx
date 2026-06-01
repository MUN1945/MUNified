'use client'

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react'
import { useI18nStore, type Locale, getDirection } from './store'

// Import translation files
import en from './locales/en.json'
import ar from './locales/ar.json'

const translations: Record<Locale, Record<string, unknown>> = { en, ar }

interface I18nContextType {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: (key: string, params?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function useTranslation() {
  return useI18n()
}

// Helper: resolve a dot-notation key from a nested object
function resolve(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : undefined
}

// Helper: replace {{param}} placeholders in a string
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`))
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, toggleLocale } = useI18nStore()
  const dir = getDirection(locale)
  const [mounted, setMounted] = useState(false)

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = translations[locale]
      let value = resolve(messages, key)
      if (value === undefined) {
        value = resolve(translations.en, key)
      }
      if (value === undefined) {
        return key
      }
      return interpolate(value, params)
    },
    [locale]
  )

  const contextValue = useMemo(
    () => ({ locale, dir, t, setLocale, toggleLocale }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, dir, t]
  )

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
    setMounted(true)
  }, [dir, locale])

  // Prevent hydration mismatch by not rendering until mounted
  // This ensures server always renders LTR/EN and client hydrates correctly
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}
