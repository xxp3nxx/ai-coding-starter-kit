# PROJ-1: User Authentication & Roles

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
