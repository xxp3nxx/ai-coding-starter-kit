# PROJ-7: Waitlist Management

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-5 (Booking & Cancellation) — waitlist is triggered when a class is full or when a booking is cancelled
- Requires: PROJ-8 (Notifications & Reminders) — athletes are notified when they move from waitlist to confirmed

## Overview
When a class reaches full capacity, athletes can join a waitlist. When a booking is cancelled, the first athlete on the waitlist is automatically promoted to a confirmed booking and notified. This ensures classes stay full and athletes don't miss out.

## User Stories
- As an athlete, I want to join the waitlist for a full class so that I get a spot automatically if someone cancels.
- As an athlete, I want to be notified immediately when I am promoted from the waitlist to a confirmed booking.
- As an athlete, I want to leave the waitlist if I no longer want the class.
- As an athlete, I want to see my current position on the waitlist so that I can decide whether to wait.
- As a trainer, I want to see the current waitlist for my classes so that I understand demand.

## Acceptance Criteria
- [ ] When a class is full, the "Book Now" button is replaced with "Join Waitlist"
- [ ] Athletes can join the waitlist; their position is determined by the timestamp of joining (FIFO)
- [ ] Each athlete can only appear once on the waitlist per class
- [ ] When a booking is cancelled, the first athlete on the waitlist is automatically promoted to a confirmed booking
- [ ] For paid classes: when promoted from the waitlist, the athlete receives an email with a "Confirm & Pay" link; they have 30 minutes to complete payment before the next person on the waitlist is offered the spot
- [ ] For free classes: promotion from waitlist is immediate; athlete is notified and booking is confirmed automatically
- [ ] If the promoted athlete does not pay within 30 minutes, the next person on the waitlist is offered the spot
- [ ] Athlete can view their waitlist position on the class detail page (when logged in)
- [ ] Athlete can remove themselves from the waitlist at any time
- [ ] Trainer can see the waitlist count and list of waitlisted athletes on their class management page

## Edge Cases
- What if the entire waitlist is exhausted but the class still has empty spots (e.g. many athletes left the waitlist)? → The class reverts to open booking for new athletes.
- What if the class is cancelled while athletes are on the waitlist? → All waitlisted athletes are notified that the class is cancelled; waitlist is cleared; no payment is processed.
- What if the promoted athlete's card is declined when trying to pay? → Treat as non-payment; move to the next person after the 30-minute window.
- What if two athletes are promoted at almost the same time due to two simultaneous cancellations? → Each promotion event processes independently; both athletes can be confirmed if there are 2 available spots.
- What if an athlete is on the waitlist for a class they are already booked in (edge case from seat swap)? → Prevent duplicate entries; show "You are already booked" instead of waitlist option.

## Technical Requirements
- `waitlist_entries` table: id, class_id, athlete_id, position, joined_at, status (waiting / offered / expired / removed)
- Position is calculated by ordering on `joined_at`; use a sequence lock to avoid race conditions on promotion
- 30-minute payment window enforced via a scheduled job or Supabase Edge Function cron
- Waitlist promotion triggers a notification via PROJ-8

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
