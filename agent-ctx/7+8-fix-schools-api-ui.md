# Task 7+8 — Fix Schools API & UI Agent

## Summary
Fixed the Schools API to be database-backed using Prisma, and resolved multiple UI contrast, visibility, and broken link issues on the landing page.

## Part 1: Schools API — DB-Backed

### `/src/app/api/schools/route.ts` — Complete rewrite
- Removed hardcoded 35-school in-memory array
- GET: Prisma queries with filtering (q, country, emirate, city, schoolType, curriculum, munActive, isVerified, isFeatured), pagination, sorting
- POST: Creates school in DB with duplicate checking and Prisma error handling

### `/src/app/api/schools/[id]/route.ts` — New file
- GET: Single school with relation counts
- PATCH: Partial update with duplicate name checking
- DELETE: Soft delete (isActive = false)

## Part 2: UI Fixes on Landing Page

### Background Image
- Fixed HeroBackground with proper inline style for fixed attachment
- Full-page background with separate 96% opacity overlay for readability

### Contrast Fixes (20+ text elements)
- All text opacity values raised from /30-/45 range to /40-/60 range
- Footer, mock dashboard, and all section descriptions improved

### Broken Links Fixed
- "For Schools" → /auth/register?role=SCHOOL_ADMIN
- "Book a Demo" → /auth/register (was alert())
- Footer links → proper hrefs instead of JS actions/alerts

### Assessment Pyramid Enhancement
- Smoother width progression, tighter spacing
- Enhanced animations (scale entrance, star wiggle)
- Top tier gets ring-2, stronger glow, animated star

### Other Fixes
- AuthSection type: Page → string
- School selector: 'DELEGATE' → 'STUDENT'
- Removed unused eslint-disable

## Lint: 0 errors, 0 warnings
