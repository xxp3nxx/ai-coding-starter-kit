# PROJ-1: User Authentication & Roles

## Status: In Progress
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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
