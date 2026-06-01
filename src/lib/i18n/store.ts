import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'en' | 'ar'

interface I18nState {
  locale: Locale
}

interface I18nActions {
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

export const useI18nStore = create<I18nState & I18nActions>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((state) => ({ locale: state.locale === 'en' ? 'ar' : 'en' })),
    }),
    {
      name: 'diplomatiq-locale',
    }
  )
)

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar'
}
