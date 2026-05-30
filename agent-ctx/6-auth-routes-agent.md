# Task 6 — Auth Routes & Navigation Agent

## Summary
Built proper Next.js page routes, auth pages, and fixed navigation from monolithic SPA to proper file-based routing.

## Work Completed

### Prisma Schema Changes
- Added `PasswordResetToken` model (email, token unique, expiresAt, used)
- Added `EmailVerificationToken` model (same fields)
- Pushed to Neon PostgreSQL successfully

### Auth Pages (4 new pages)
- `/auth/signin` — Professional sign-in with DiplomatiQ branding, NextAuth credentials, remember me, error display
- `/auth/register` — Registration with validation, role selection, auto-login
- `/auth/forgot-password` — Email form with success state, rate-limited API
- `/auth/reset-password` — Token-based password reset with validation

### API Routes (3 new routes)
- `/api/auth/forgot-password` — Token generation, rate limiting, anti-enumeration
- `/api/auth/reset-password` — Token validation, password update, session invalidation
- `/api/auth/verify-email` — Token validation, emailVerified flag

### Dashboard Route
- `/dashboard` — Protected route rendering AppShell, redirects to signin if unauthenticated

### NextAuth Config Update
- Added redirect callback (default to /dashboard)
- Added error page config

### Middleware Overhaul
- Protects /dashboard/* with JWT auth check
- Protects /api/admin/* with role check
- Public routes: /, /auth/*, /api/auth/*
- Rate limiting + security headers maintained

### Landing Page Update
- Removed Zustand-based SPA navigation
- CTA buttons now navigate to proper routes (/auth/signin, /auth/register)
- Auto-redirect to /dashboard if authenticated

## Files Created
- src/app/auth/signin/page.tsx
- src/app/auth/register/page.tsx
- src/app/auth/forgot-password/page.tsx
- src/app/auth/reset-password/page.tsx
- src/app/api/auth/forgot-password/route.ts
- src/app/api/auth/reset-password/route.ts
- src/app/api/auth/verify-email/route.ts
- src/app/dashboard/page.tsx

## Files Modified
- prisma/schema.prisma
- src/lib/auth.ts
- src/middleware.ts
- src/app/page.tsx

## Issues
- None — lint passed with 0 errors
