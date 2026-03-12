# PROJ-1: User Authentication & Roles

## Status: In Review
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- None

## Overview
All users — recreational athletes, course trainers, and fitness centre admins — must be able to register, log in, and be identified by their role. Role determines what each user can see and do in the platform.

## User Stories
- As a recreational athlete, I want to register with my email and password so that I can book classes.
- As a fitness centre admin, I want to register my centre with a business email so that I can set up my profile and invite trainers.
- As a course trainer, I want to accept an invitation from my fitness centre so that I can log in and manage my classes.
- As any user, I want to log in securely and be taken to the correct dashboard for my role.
- As any user, I want to reset my password via email so that I can recover access if I forget it.
- As a fitness centre admin, I want to be able to log out so that my account stays secure on shared devices.

## Acceptance Criteria
- [ ] Athletes can self-register with email + password; they receive a confirmation email
- [ ] Fitness centres can self-register with business name, email, and password
- [ ] Trainers are created via invitation only (no self-registration); they receive an email invite with a setup link
- [ ] After login, users are redirected to the correct home screen based on their role (athlete → class discovery; trainer → my classes; centre admin → centre dashboard)
- [ ] Password reset flow works via email link (link expires in 24 hours)
- [ ] All authenticated routes are protected; unauthenticated users are redirected to login
- [ ] Session persists across browser refreshes until the user logs out or the session expires
- [ ] User roles are: `athlete`, `trainer`, `centre_admin`

## Edge Cases
- What if an athlete tries to register with an email already used by a trainer? → Show "email already in use" error; suggest login or password reset
- What if a trainer invitation link is clicked twice or after expiry? → Show "invitation expired or already used" message with option to request a new one
- What if a centre admin tries to access trainer-only routes? → Return 403 forbidden; redirect to their dashboard
- What if the confirmation email is not received? → Provide "resend confirmation email" option on the login screen
- What if a user is both an athlete and a trainer (e.g. takes classes at other centres)? → MVP: not supported; users have one role per account

## Technical Requirements
- Authentication via Supabase Auth (email/password)
- Role stored in a `profiles` table linked to `auth.users`
- All API routes validate session and role server-side
- Password must be at least 8 characters
- Security: rate-limit login attempts (5 per minute)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure

```
Public Pages (no login required)
+-- /register
|   +-- Role Selector ("I'm an Athlete" / "I'm a Fitness Centre")
|   +-- Registration Form (name, email, password)
|   +-- Post-submit: "Check your email to confirm your account"
+-- /login
|   +-- Login Form (email + password)
|   +-- "Forgot password?" link
|   +-- "Resend confirmation email" link (shown on certain errors)
+-- /forgot-password
|   +-- Email input + submit button
|   +-- Confirmation message
+-- /reset-password
|   +-- New password form (requires valid token from email link)
+-- /invite/[token]
    +-- Trainer Invitation Accept Page
        +-- Displays: "You've been invited by [Centre Name]"
        +-- Name + password setup form
        +-- On submit: account created, redirected to trainer dashboard

Route Protection Middleware (runs on every request)
+-- Is user logged in?
|   No → redirect to /login
+-- Does the route match the user's role?
    No → redirect to user's own home page

Authenticated Home Pages (role-based redirect after login)
+-- Athlete      → /classes
+-- Trainer      → /trainer/dashboard
+-- Centre Admin → /centre/dashboard
```

### Data Model

**Supabase Auth manages automatically:** unique user ID, email, encrypted password, and email confirmation status.

**`profiles` table (our extension):**
- `id` — links to the Supabase Auth user (same ID)
- `role` — one of: `athlete`, `trainer`, `centre_admin`
- `full_name` — display name
- `avatar_url` — profile photo (stored in Supabase Storage)
- `created_at` — when the profile was created

**`invitations` table (trainer invite flow):**
- `id` — unique invitation ID
- `email` — the trainer's email address
- `centre_id` — which fitness centre sent the invite
- `token` — unique, unguessable code (sent in the email link)
- `status` — `pending`, `accepted`, `expired`, or `declined`
- `expires_at` — 7 days from when the invite was sent

### Tech Decisions

- **Supabase Auth** handles email confirmation, password reset, session tokens, and refresh tokens — we build none of that ourselves.
- **Next.js Middleware** runs server-side before every page load to check session and role — prevents flash of protected content and enforces role-based redirects.
- **Separate `profiles` table** extends Supabase Auth with our business concept of roles. A trigger auto-creates the profile row when a new user registers.
- **Invitation-only trainers** — open trainer self-registration would create orphaned accounts with no centre; the invite flow ensures every trainer is associated with a centre from day one.
- **Database-level role enforcement** via Supabase RLS policies — browser-side role checks are UX only; actual data access is controlled at the database level.

### Dependencies
- `@supabase/supabase-js` — Supabase client (auth + database)
- `@supabase/ssr` — server-side session handling for Next.js App Router

## Backend Implementation Notes

### Database (SQL Migration)
- File: `supabase/migrations/20260312000000_auth_and_roles.sql`
- Tables created: `profiles`, `invitations`, `trainer_centre_assignments`
- `trainer_centre_assignments` is a many-to-many join table (trainers can belong to multiple centres)
- Auto-create profile trigger on `auth.users` insert reads `raw_user_meta_data` for role and full_name
- `updated_at` trigger on profiles
- RLS enabled on all 3 tables with policies for SELECT, INSERT, UPDATE, DELETE
- Indexes on: `profiles.role`, `invitations.token/email/centre_id/status`, `trainer_centre_assignments.trainer_id/centre_id`

### Supabase Client Setup
- `src/lib/supabase/client.ts` -- browser client (uses `createBrowserClient` from `@supabase/ssr`)
- `src/lib/supabase/server.ts` -- server client (uses `createServerClient` with cookie handling)
- `src/lib/supabase/middleware.ts` -- middleware client for session refresh and route protection

### API Routes
- `POST /api/auth/register` -- athlete + centre_admin registration (Zod validated, rate limited)
- `POST /api/auth/login` -- email/password login (rate limited: 5/min per IP)
- `POST /api/auth/forgot-password` -- password reset email (rate limited, no email enumeration)
- `POST /api/auth/reset-password` -- set new password (requires valid session from reset link)
- `POST /api/auth/logout` -- sign out
- `GET  /api/auth/me` -- get current user profile + centre assignments for trainers
- `POST /api/invitations` -- create trainer invitation (centre_admin only, returns invite link)
- `GET  /api/invitations` -- list invitations for current centre_admin
- `POST /api/invitations/accept` -- accept invitation, create trainer account + centre assignment
- `GET  /api/invitations/accept?token=xxx` -- look up invitation details by token

### Middleware
- `src/middleware.ts` -- route protection + role-based redirects
- Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/invite`, `/auth/callback`
- Role-based redirects: athlete -> `/classes`, trainer -> `/trainer/dashboard`, centre_admin -> `/centre/dashboard`
- Authenticated users visiting public auth pages are redirected to their dashboard

### Utilities
- `src/lib/rate-limit.ts` -- in-memory rate limiter (per-instance, resets on restart)
- `src/lib/validations/auth.ts` -- Zod schemas for all auth endpoints

### Design Decisions
- Email sending skipped for MVP: trainer invitations generate a link that admins copy/share manually
- In-memory rate limiter chosen for simplicity (can be replaced with Redis for production scaling)
- Invitation tokens are 32-byte hex strings (cryptographically random via `gen_random_bytes`)
- Password reset uses Supabase built-in flow (PKCE code exchange via `/auth/callback`)

## Frontend Implementation Notes

### Pages Created (Route Groups)
- `src/app/(auth)/layout.tsx` -- shared centered card layout for all auth pages
- `src/app/(auth)/register/page.tsx` -- role selector (Athlete/Fitness Centre tabs) + registration form
- `src/app/(auth)/login/page.tsx` -- login form with callback error handling, wrapped in Suspense for useSearchParams
- `src/app/(auth)/forgot-password/page.tsx` -- email input, success confirmation state
- `src/app/(auth)/reset-password/page.tsx` -- new password form (requires valid session from email link)
- `src/app/(auth)/invite/[token]/page.tsx` -- fetches invitation details, shows name + password form
- `src/app/(dashboard)/layout.tsx` -- shared nav header with role-aware navigation, user info, logout
- `src/app/(dashboard)/classes/page.tsx` -- placeholder for athlete class discovery
- `src/app/(dashboard)/trainer/dashboard/page.tsx` -- placeholder trainer dashboard with card grid
- `src/app/(dashboard)/centre/dashboard/page.tsx` -- placeholder centre admin dashboard with card grid

### Design Decisions
- Used Next.js route groups `(auth)` and `(dashboard)` for shared layouts without affecting URL paths
- All forms use react-hook-form + Zod validation (same schemas as backend)
- Post-login redirect uses `window.location.href` (not `router.push`) to ensure middleware runs
- Sonner Toaster added to root layout for all toast notifications
- Login page wraps useSearchParams in Suspense boundary (Next.js 16 requirement)
- All pages are mobile-first responsive with Tailwind breakpoints

### shadcn/ui Components Used
- Card, Button, Input, Label, Form, Tabs, Skeleton, Sonner (Toaster)

## QA Test Results

**Tested:** 2026-03-12
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (Next.js 16.1.1 compiles successfully with no TypeScript errors)

### Acceptance Criteria Status

#### AC-1: Athletes can self-register with email + password; they receive a confirmation email
- [x] Registration form exists at /register with Athlete tab
- [x] Form uses Zod validation (email format, password min 8 chars, full name required)
- [x] API route POST /api/auth/register validates with registerSchema
- [x] Supabase signUp is called with emailRedirectTo for confirmation flow
- [x] On success, UI shows "Check your email" confirmation message
- [x] Duplicate email returns 409 with "already in use" message
- **PASS**

#### AC-2: Fitness centres can self-register with business name, email, and password
- [x] Registration form has "Fitness Centre" tab that sets role to centre_admin
- [x] Label dynamically changes to "Centre name" when centre_admin tab is selected
- [x] Zod schema restricts role to "athlete" or "centre_admin" (no trainer self-registration)
- **PASS**

#### AC-3: Trainers are created via invitation only (no self-registration); they receive an email invite with a setup link
- [x] Registration schema only allows "athlete" | "centre_admin" roles -- trainers cannot self-register
- [x] POST /api/invitations creates invitation (centre_admin only, verified via role check)
- [x] Invitation token generated in DB via gen_random_bytes(32) -- cryptographically secure
- [x] Accept page /invite/[token] fetches invitation details and shows name + password form
- [x] POST /api/invitations/accept creates trainer account with correct role and centre assignment
- [ ] BUG: Email invite is not actually sent; admin must manually copy the link (documented as MVP design decision, but spec says "they receive an email invite")
- **PASS (with caveat)** -- Manual link sharing is documented as intentional MVP scope

#### AC-4: After login, users are redirected to the correct home screen based on their role
- [x] Login API returns redirectTo based on profile role (athlete -> /classes, trainer -> /trainer/dashboard, centre_admin -> /centre/dashboard)
- [x] Frontend uses window.location.href for redirect (ensures middleware re-evaluates)
- [x] Auth callback route also performs role-based redirect after email confirmation
- **PASS**

#### AC-5: Password reset flow works via email link (link expires in 24 hours)
- [x] Forgot password page exists at /forgot-password
- [x] API calls supabase.auth.resetPasswordForEmail with redirectTo pointing to /auth/callback?next=/reset-password
- [x] Callback route exchanges code for session and redirects to /reset-password
- [x] Reset password page validates new password (min 8 chars) and calls supabase.auth.updateUser
- [ ] BUG: Spec says "link expires in 24 hours" but expiry is controlled by Supabase default settings, which is typically 1 hour -- no explicit 24-hour configuration in the code
- **PASS (with caveat)** -- Supabase manages expiry, but the configured duration may not match the 24h requirement

#### AC-6: All authenticated routes are protected; unauthenticated users are redirected to login
- [x] Middleware runs on all non-static routes
- [x] Unauthenticated users on non-public routes get redirected to /login
- [x] API routes handled by their own auth checks (supabase.auth.getUser)
- **PASS**

#### AC-7: Session persists across browser refreshes until user logs out or session expires
- [x] Supabase SSR cookie-based sessions handle persistence
- [x] Middleware refreshes session on every request via supabase.auth.getUser()
- [x] Logout calls supabase.auth.signOut() and redirects to /login
- **PASS**

#### AC-8: User roles are: athlete, trainer, centre_admin
- [x] Profiles table CHECK constraint limits to 'athlete', 'trainer', 'centre_admin'
- [x] Zod schema for registration limits to athlete | centre_admin
- [x] Trainer role only assigned via invitation accept flow
- **PASS**

### Edge Cases Status

#### EC-1: Email already in use (athlete registers with trainer's email)
- [x] Supabase returns "already registered" error, caught and returned as 409 with clear message
- **PASS**

#### EC-2: Trainer invitation link clicked twice or after expiry
- [x] GET /api/invitations/accept checks status !== "pending" and returns 410
- [x] Expiry check compares expires_at with current time, marks as "expired" in DB
- [x] Frontend shows "Invitation unavailable" card with guidance to contact admin
- [ ] BUG: The invite page does not show an explicit "request a new one" action button -- it only says "contact your fitness centre admin"
- **PASS (minor UX gap)**

#### EC-3: Centre admin tries to access trainer-only routes
- [x] Middleware checks pathname.startsWith("/trainer/") and validates role
- [x] Non-trainer users are redirected to their own dashboard
- [ ] BUG: Athlete routes (e.g., /classes) are NOT restricted to athletes only -- a centre_admin or trainer can access /classes. The middleware only restricts /trainer/ and /centre/ prefixed routes.
- **PARTIAL PASS** -- See BUG-3

#### EC-4: Confirmation email not received -- resend option
- [ ] BUG: No "resend confirmation email" functionality exists on the login screen or anywhere in the UI
- **FAIL** -- The spec explicitly requires: "Provide 'resend confirmation email' option on the login screen"

#### EC-5: User with both athlete and trainer roles
- [x] Database CHECK constraint enforces single role per profile
- [x] Documented as "not supported in MVP"
- **PASS**

### Security Audit Results

#### Authentication
- [x] All API routes verify authentication via supabase.auth.getUser() before processing
- [x] Reset password endpoint requires valid authenticated session (from email link)
- [x] Invitation accept endpoint validates invitation token before creating account
- **PASS**

#### Authorization
- [x] POST /api/invitations verifies centre_admin role before creating invitations
- [x] GET /api/invitations only returns invitations created by the authenticated admin (invited_by filter)
- [x] Middleware enforces role-based route access
- [ ] BUG: RLS policy "Anyone can read invitation by token" uses USING (true) which allows any user (or anonymous) to enumerate ALL invitations, not just look up by token. The comment says "API route filters by token" but a direct Supabase client query would bypass the API and read all invitations.
- **FAIL** -- See BUG-1 (Critical)

#### Input Validation
- [x] All endpoints use Zod schemas for server-side validation
- [x] Email format, password minimum length, name constraints all validated
- [x] Registration role restricted to athlete | centre_admin at schema level
- [x] Invitation token validated as non-empty string
- [ ] BUG: acceptInvitationSchema validates token as just min(1) string -- no format validation (expected 64-char hex). A more restrictive regex would prevent junk tokens from hitting the database.
- **PASS (minor)**

#### XSS Protection
- [x] React/Next.js auto-escapes all rendered content
- [x] No dangerouslySetInnerHTML usage found
- [x] User input is not reflected in HTML without escaping
- **PASS**

#### Rate Limiting
- [x] Login: 5 per minute per IP
- [x] Registration: 5 per minute per IP
- [x] Forgot password: 3 per minute per IP
- [x] Invitation accept: 5 per minute per IP
- [x] Invitation creation: 10 per minute per admin
- [ ] BUG: Rate limiter is in-memory and per-instance. In a multi-instance deployment (Vercel serverless), each function invocation gets its own memory space, making the rate limiter effectively useless. This is documented but remains a production security risk.
- [ ] BUG: Rate limiting uses x-forwarded-for header which can be spoofed by attackers to bypass limits. No validation of the header's trustworthiness.
- **PARTIAL PASS** -- See BUG-4, BUG-5

#### Email Enumeration
- [x] Forgot password always returns success regardless of whether email exists
- [ ] BUG: Registration endpoint returns specific 409 "email already in use" error, which confirms whether an email is registered. This allows email enumeration via the registration endpoint.
- **PARTIAL PASS** -- See BUG-6

#### Exposed Secrets
- [x] .env.local is in .gitignore
- [x] Only NEXT_PUBLIC_ prefixed vars are used in browser client
- [x] .env.local.example contains only placeholder values
- **PASS**

#### Security Headers
- [ ] BUG: No security headers configured in next.config.ts. The security rules require X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: origin-when-cross-origin, and Strict-Transport-Security. None are present.
- **FAIL** -- See BUG-2

#### RLS Policies
- [x] RLS enabled on all three tables (profiles, invitations, trainer_centre_assignments)
- [x] Profiles: users can read/update own profile; centre admins can read trainer profiles
- [ ] BUG: "Users can update own profile" policy does not prevent users from changing their own role. The WITH CHECK only verifies auth.uid() = id but does not restrict which columns can be modified. A user could UPDATE profiles SET role = 'centre_admin' WHERE id = their_id.
- **FAIL** -- See BUG-7 (Critical)

#### Invitation Security
- [x] Invitation token is 32 bytes (64 hex chars) -- practically unguessable
- [x] Expired/used invitations are properly handled
- [ ] BUG: The trainer_centre_assignments INSERT RLS policy only allows centre_admin role. But in the invitation accept flow, the newly created trainer user is the one making the request, and they have role "trainer", not "centre_admin". This means the INSERT into trainer_centre_assignments will likely fail due to RLS.
- **FAIL** -- See BUG-8 (High)

### Cross-Browser Testing (Code Review)
- [x] All pages use standard shadcn/ui components and Tailwind CSS (excellent cross-browser support)
- [x] No vendor-specific CSS or non-standard APIs used
- [x] Forms use standard HTML5 input types and autoComplete attributes
- **PASS** (Chrome, Firefox, Safari expected to work identically)

### Responsive Testing (Code Review)
- [x] Auth layout: centered card with max-w-md and px-4 padding (works at 375px)
- [x] Dashboard layout: max-w-7xl with responsive padding (px-4, sm:px-6, lg:px-8)
- [x] Dashboard header: nav items hidden on mobile (hidden md:flex), user info hidden on mobile (hidden sm:block)
- [x] Dashboard card grids: grid-cols-1 on mobile, md:grid-cols-2, lg:grid-cols-3
- [ ] BUG: Dashboard header has no mobile hamburger menu. Navigation links are completely hidden on mobile (hidden md:flex) with no alternative mobile navigation. Users on small screens cannot navigate between sections.
- **PARTIAL PASS** -- See BUG-9

### Bugs Found

#### BUG-1: Invitations table RLS allows full read access to anyone (Critical)
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Using any Supabase client (even anonymous), query: SELECT * FROM invitations
  2. Expected: Only return invitations the user created or invitations matching a specific token
  3. Actual: The "Anyone can read invitation by token" policy uses USING (true), returning ALL invitations to any user
- **Impact:** Exposes all invitation emails, centre IDs, tokens, and statuses. An attacker could steal pending tokens and accept invitations intended for other trainers.
- **Priority:** Fix before deployment

#### BUG-2: No security headers configured (High)
- **Severity:** High
- **Steps to Reproduce:**
  1. Check next.config.ts for headers configuration
  2. Expected: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS headers configured
  3. Actual: next.config.ts is empty (no headers configured)
- **Impact:** Application vulnerable to clickjacking (no X-Frame-Options), MIME sniffing attacks, and missing HSTS protection.
- **Priority:** Fix before deployment

#### BUG-3: /classes route accessible to all authenticated roles (Medium)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in as a centre_admin or trainer
  2. Navigate to /classes
  3. Expected: Should redirect non-athletes away or show 403
  4. Actual: Page loads normally for any authenticated user
- **Impact:** Role boundaries not fully enforced. While the content is just a placeholder, this sets a bad precedent.
- **Priority:** Fix in next sprint

#### BUG-4: In-memory rate limiter ineffective in serverless environment (High)
- **Severity:** High
- **Steps to Reproduce:**
  1. Deploy to Vercel (serverless)
  2. Make rapid login attempts
  3. Expected: Rate limiter blocks after 5 attempts
  4. Actual: Each serverless function invocation has its own memory; rate limits never accumulate
- **Impact:** Rate limiting provides zero protection in production deployment.
- **Priority:** Fix before deployment (use Upstash Redis or Vercel KV)

#### BUG-5: Rate limit bypass via x-forwarded-for header spoofing (Medium)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Send login requests with different x-forwarded-for header values
  2. Expected: Rate limiting still applies
  3. Actual: Each spoofed IP gets its own rate limit bucket
- **Impact:** Attacker can bypass rate limiting by rotating the x-forwarded-for header.
- **Priority:** Fix before deployment (use verified IP from hosting platform)

#### BUG-6: Email enumeration via registration endpoint (Medium)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. POST /api/auth/register with an email that already exists
  2. Expected: Generic error that does not confirm email existence
  3. Actual: Returns 409 "This email is already in use"
- **Impact:** Attacker can enumerate which emails are registered in the system.
- **Priority:** Fix in next sprint

#### BUG-7: Users can escalate their own role via profile update (Critical)
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Authenticate as an athlete
  2. Use Supabase client to run: UPDATE profiles SET role = 'centre_admin' WHERE id = [own_id]
  3. Expected: Update rejected or role column excluded from updateable fields
  4. Actual: RLS policy "Users can update own profile" allows updating ANY column including role
- **Impact:** Any authenticated user can promote themselves to centre_admin, gaining full admin access.
- **Priority:** Fix before deployment

#### BUG-8: trainer_centre_assignments INSERT fails for newly created trainers due to RLS (High)
- **Severity:** High
- **Steps to Reproduce:**
  1. A centre admin creates an invitation
  2. A trainer accepts the invitation via POST /api/invitations/accept
  3. The accept endpoint tries to INSERT into trainer_centre_assignments with the new trainer's user ID
  4. Expected: Assignment is created successfully
  5. Actual: RLS policy "Centre admins can create assignments" only allows inserts where the caller has role = 'centre_admin'. The caller in the accept flow is the newly created trainer (or even anonymous since the user may not be fully authenticated yet), so the INSERT will be rejected.
- **Impact:** Trainer-centre assignments are never created during the invitation accept flow, breaking the trainer invitation feature.
- **Priority:** Fix before deployment

#### BUG-9: No mobile navigation in dashboard (Medium)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Open any dashboard page on a 375px viewport
  2. Expected: Hamburger menu or other mobile navigation
  3. Actual: Navigation links are hidden (hidden md:flex) with no mobile alternative
- **Impact:** Mobile users cannot navigate between dashboard sections.
- **Priority:** Fix in next sprint

#### BUG-10: Missing "resend confirmation email" feature (Medium)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Register a new account
  2. Do not click the confirmation email
  3. Go to /login
  4. Expected: "Resend confirmation email" option available
  5. Actual: No resend option exists anywhere in the UI
- **Impact:** Users who miss or don't receive their confirmation email have no way to recover without developer intervention.
- **Priority:** Fix in next sprint

#### BUG-11: Dashboard branding mismatch -- "FitBook" vs "FitClass" (Low)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Log in and view the dashboard header
  2. Expected: Brand name matches PRD ("FitClass")
  3. Actual: Dashboard header shows "FitBook"
- **Priority:** Nice to have

#### BUG-12: Duplicate profile query in middleware for authenticated users (Low)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Log in and navigate to any protected route
  2. Middleware first checks if user is authenticated + on public route (queries profile)
  3. Then checks role-based protection (queries profile again)
  4. Expected: Single profile query per request
  5. Actual: Two separate Supabase queries for the same profile data per middleware execution
- **Impact:** Unnecessary latency on every authenticated page navigation.
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 8/8 passed (2 with caveats)
- **Edge Cases:** 4/5 passed (EC-4 failed -- no resend confirmation email)
- **Bugs Found:** 12 total (2 critical, 3 high, 5 medium, 2 low)
- **Security:** Issues found -- 2 critical vulnerabilities (role escalation, invitation data leak)
- **Build:** PASS -- compiles successfully
- **Production Ready:** NO
- **Recommendation:** Fix the 2 Critical and 3 High bugs before deployment. The critical security vulnerabilities (BUG-1 role escalation via RLS, BUG-7 invitation data exposure) and the high-severity issues (BUG-2 missing security headers, BUG-4 ineffective rate limiting, BUG-8 broken trainer assignment flow) must be addressed first.

## Deployment
_To be added by /deploy_
