# PROJ-5: Booking & Cancellation

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1 (User Authentication & Roles) — athlete must be logged in to book
- Requires: PROJ-4 (Class Discovery & Search) — athlete discovers the class first
- Requires: PROJ-6 (Payments) — for paid classes, payment is collected at booking

## Overview
Athletes book and cancel classes. The system enforces capacity limits automatically — once a class is full, no further bookings are accepted. Athletes can cancel bookings up to a configurable cutoff time before the class starts.

## User Stories
- As an athlete, I want to book a class so that my spot is reserved.
- As an athlete, I want to cancel my booking so that I can free up the spot if my plans change.
- As an athlete, I want to see all my upcoming bookings in one place so that I know what classes I have scheduled.
- As an athlete, I want to see my past class history so that I can track my activity.
- As a trainer, I want to see the list of athletes booked into each of my classes so that I can prepare appropriately.

## Acceptance Criteria
- [ ] Logged-in athlete can book a class from the class detail page
- [ ] Booking is rejected if the class is already at full capacity; athlete is offered to join the waitlist instead (PROJ-7)
- [ ] Booking is rejected if the class starts in less than 1 hour ("booking closed")
- [ ] Each athlete can only have 1 booking per class (no duplicate bookings)
- [ ] After a successful booking, athlete receives a confirmation (email via PROJ-8)
- [ ] Athlete can cancel a booking up to 2 hours before the class start time (configurable per centre)
- [ ] Cancellations within the cutoff window are blocked with a message explaining the policy
- [ ] When an athlete cancels, their spot is freed and the waitlist is triggered (PROJ-7)
- [ ] "My Bookings" page shows upcoming bookings (sorted by date) and past bookings
- [ ] Trainer can view a participant list for each class: athlete name, booking status, and booking time

## Edge Cases
- What if an athlete tries to book two classes that overlap in time? → Allow it; show a warning "This class overlaps with another booking" but do not block.
- What if an athlete books a free class but then the class is retrospectively changed to paid? → Existing bookings are honoured at the original price (free); only new bookings pay.
- What if the last available spot is claimed by two athletes simultaneously? → Use a database transaction to ensure only one booking succeeds; the second athlete receives an error and is offered the waitlist.
- What if an athlete has no bookings? → Show an empty state with a call-to-action to discover classes.
- What if a trainer cancels a class with existing bookings? → All athlete bookings are automatically cancelled; refunds are processed (PROJ-6); athletes are notified (PROJ-8).

## Technical Requirements
- `bookings` table: id, class_id, athlete_id, status (confirmed / cancelled / attended), booked_at, cancelled_at
- Booking creation uses a database transaction with row-level lock on the class capacity counter
- Cancellation cutoff is stored per centre (default: 2 hours before class start)
- RLS policies: athletes can only read/write their own bookings; trainers can read bookings for their classes

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
