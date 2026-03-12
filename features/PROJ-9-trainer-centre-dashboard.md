# PROJ-9: Trainer & Centre Dashboard

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-3 (Class Scheduling) — classes must exist to display
- Requires: PROJ-5 (Booking & Cancellation) — booking data drives dashboard metrics
- Requires: PROJ-6 (Payments) — revenue data shown on centre dashboard

## Overview
Trainers and fitness centre admins each get a role-specific dashboard that gives them a clear, at-a-glance view of their upcoming schedule, bookings, and performance. The goal is to make operational management effortless — the "stress-free" part of the platform's promise.

## User Stories
- As a trainer, I want to see all my upcoming classes with current booking counts so that I can prepare for each session.
- As a trainer, I want to see a quick summary of today's classes at the top of my dashboard so that I start my day informed.
- As a trainer, I want to see the list of participants for each class so that I know who is attending.
- As a fitness centre admin, I want to see an overview of all classes across all my trainers for a given week so that I can spot scheduling gaps or conflicts.
- As a fitness centre admin, I want to see revenue metrics (total bookings, revenue, refunds) for the current month so that I can track business performance.
- As a fitness centre admin, I want to see which classes are underbooked (< 50% capacity) so that I can take action (e.g. promote the class).

## Acceptance Criteria
- [ ] **Trainer dashboard:**
  - Shows "Today's Classes" section at the top (classes starting today with participant count)
  - Shows full list of upcoming classes (next 30 days) in chronological order
  - Each class row shows: title, date/time, booked / capacity count, and a quick link to the participant list
  - Participant list shows: athlete name, booking time, booking status
  - Past classes are accessible in a separate "History" tab
- [ ] **Centre admin dashboard:**
  - Shows a weekly calendar view of all classes across all trainers (colour-coded by trainer)
  - Shows a summary panel: total classes this month, total bookings this month, total revenue this month, total refunds this month
  - Highlights underbooked classes (< 50% capacity) with a warning indicator
  - Allows filtering the calendar view by trainer
  - Links to each class detail (from PROJ-3) for editing
- [ ] Both dashboards are mobile-responsive
- [ ] Dashboard data refreshes on page load (no real-time streaming needed for MVP)

## Edge Cases
- What if a trainer has no upcoming classes? → Show an empty state with a "Create your first class" call-to-action.
- What if a centre has 20+ trainers? → The calendar should paginate or filter by trainer to avoid overload.
- What if revenue data is missing (e.g. Stripe webhook hasn't fired yet)? → Show the last known confirmed revenue with a "last updated" timestamp.
- What if a trainer views the dashboard just after midnight and "Today's Classes" is empty? → Show "No classes today" with a link to tomorrow's schedule.
- What if a class has zero bookings? → Show "0 / X booked" — never hide 0-booking classes from the trainer's view.

## Technical Requirements
- Dashboard data fetched server-side for initial load; no real-time subscription needed in MVP
- Revenue metrics aggregated via Supabase SQL views / RPCs (not calculated in the frontend)
- Participant list access gated by RLS: trainer can only see participants for their own classes; centre admin can see all classes in their centre
- Calendar component uses a lightweight library (e.g. react-big-calendar or custom CSS grid)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
