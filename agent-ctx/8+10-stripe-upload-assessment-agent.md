# Task 8+10 Agent — Stripe Fix, File Upload, Assessment Seeds

## Task: Fix Stripe integration, add file upload for research papers, and seed assessment questions

### Work Completed

## Part 1: Stripe Integration Fixes

### `/src/lib/stripe.ts`
- Added `isStripeConfigured()` helper that checks if STRIPE_SECRET_KEY is a valid Stripe key (not placeholder)
- Added `createStripeProducts()` async function that programmatically creates all Stripe products and prices (Student Pro, Teacher Pro, School Starter/Professional, Conference packages)
- Added documentation note that price IDs must be created in Stripe Dashboard or via `createStripeProducts()`
- Kept all existing PRICING_PLANS config and helper functions (getPriceId, getDisplayPrice)

### `/src/app/api/stripe/checkout/route.ts`
- Added NextAuth session check (returns 401 if not authenticated)
- Added validation for plan type against PRICING_PLANS keys
- Added validation for billing period (must be "monthly" or "annual")
- Added Stripe configuration check via `isStripeConfigured()` — returns 503 with clear message when not configured
- For Student/Teacher plans without Stripe: "Payment processing is currently being configured"
- For School plans without Stripe: redirects to contact-sales
- Added Stripe-specific error handling (invalid price IDs, API key errors)
- Falls back to session user email if no email in request body

### `/src/app/api/stripe/webhook/route.ts`
- Added proper signature verification: uses real webhook secret if configured, logs warning and skips verification for development
- Added `logAuditEvent()` function that logs all events to AuditLog table
- Added all missing event handlers:
  - `customer.subscription.trial_will_end` — logs upcoming trial end
  - `customer.created/updated/deleted` — customer lifecycle management
  - `payment_intent.succeeded/payment_failed` — payment tracking
  - `charge.refunded` — records refund payments
  - `charge.dispute.created/updated/closed` — dispute tracking
  - `invoice.paid` — reuses payment success handler
  - `invoice.payment_action_required` — logs action needed
  - `product.created/updated`, `price.created/updated` — catalog tracking
- All event handlers log to AuditLog
- Handler errors are also logged to AuditLog

### `/src/app/api/subscriptions/route.ts`
- Removed simulated checkout fallback (was creating fake checkout URLs)
- Removed webhook action handler (moved to dedicated webhook endpoint)
- Added `isStripeConfigured()` check — returns 503 for Student/Teacher plans, redirects to contact-sales for school plans
- Added "reactivate" action for subscriptions cancelled at period end
- Cancel action now also cancels via Stripe API if configured
- Reactivate action also reactivates via Stripe API if configured
- Added `stripeConfigured` flag in GET response for frontend

## Part 2: File Upload System

### `/src/app/api/upload/route.ts` (NEW)
- Handles POST multipart file uploads
- Validates file type: only PDF, DOCX, TXT allowed
- Validates file size: max 10MB
- Generates unique filenames with timestamp + UUID + sanitized original name
- Stores files in `/home/z/my-project/uploads/` directory
- Returns fileUrl, fileName, fileSize, fileType, uploadedBy, uploadedAt
- Requires authentication

### `/src/app/api/upload/[filename]/route.ts` (NEW)
- GET: Serves uploaded files with proper MIME types
- DELETE: Removes uploaded files
- Requires authentication
- Prevents directory traversal attacks
- PDFs and TXT served inline; DOCX served as attachment
- Security headers: no-cache, nosniff

### `/home/z/my-project/uploads/` (NEW DIRECTORY)
- Created for file storage

### `/src/app/api/research/route.ts` (UPDATED)
- Added research paper creation via `type: "paper"` in POST body
- Handles fileUrl, fileName, fileSize fields from upload API
- Validates fileUrl must start with "/api/upload/" if provided
- Paper status workflow: DRAFT → SUBMITTED → UNDER_REVIEW → EVALUATED/RETURNED
- Students can only submit papers (DRAFT → SUBMITTED)
- Teachers can transition all statuses
- Added paper update via PATCH with `type: "paper"`
- Added paper deletion via DELETE with `type: "paper"` query param
- Cascading delete: removes PaperFeedback and PaperEvaluation before deleting paper

## Part 3: Assessment Question Seed

### `/prisma/seed-assessments.ts` (NEW)
- 118 comprehensive MUN-specific questions across 7 tiers
- Tier distribution:
  - TIER_1_BASIC_DELEGATE: 18 questions (parliamentary procedure basics, vocabulary, decorum)
  - TIER_2_ADVANCED_DELEGATE: 18 questions (resolution writing, negotiation, complex procedure)
  - TIER_3_COMMITTEE_LEADER: 17 questions (leadership, bloc management, crisis basics)
  - TIER_4_CHAIR: 17 questions (running committee, ruling on procedure, managing debate)
  - TIER_5_UNDER_SECRETARY_GENERAL: 16 questions (strategic thinking, multi-committee coordination)
  - TIER_6_DEPUTY_SECRETARY_GENERAL: 16 questions (executive leadership, conference management)
  - TIER_7_SECRETARY_GENERAL: 16 questions (pinnacle leadership, conference vision, SG-level decisions)
- Category breakdown: KNOWLEDGE (72), SKILLS (32), BEHAVIOR (14)
- Type breakdown: MULTIPLE_CHOICE (75), SCENARIO (43)
- Each question has: text, options (JSON), correctAnswer, explanation, difficulty (1-9), points (1-5)
- Progressive difficulty from Tier 1 (difficulty 1-2) to Tier 7 (difficulty 8-9)
- Topics cover: UN system, parliamentary procedure, resolution writing, crisis management, international law, real-world UN frameworks (SDGs, R2P, Geneva Conventions, Paris Agreement, etc.)
- Successfully seeded to Neon PostgreSQL database: 118 questions verified

### Lint: 0 errors
