# PROJ-3: Class Scheduling (Trainer)

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1 (User Authentication & Roles) — trainer role needed
- Requires: PROJ-2 (Fitness Centre Management) — trainer must belong to a centre

## Overview
Trainers create, edit, and manage their class schedule under their fitness centre. Classes can be one-off or recurring. Each class has a defined capacity limit that is automatically enforced when athletes book.

## User Stories
- As a trainer, I want to create a new class with a title, description, date/time, duration, sport type, capacity, and price so that athletes can find and book it.
- As a trainer, I want to set a class as recurring (e.g. every Monday at 9am) so that I don't have to manually recreate it each week.
- As a trainer, I want to edit an existing class's details so that I can correct mistakes or update information.
- As a trainer, I want to cancel a specific class occurrence so that registered athletes are notified and not charged.
- As a trainer, I want to view a calendar/list of all my upcoming classes with their current booking counts.
- As a fitness centre admin, I want to see all classes scheduled across all trainers in my centre.

## Acceptance Criteria
- [ ] Trainer can create a class with: title (required), description, sport/activity type (select from predefined list), date & time, duration in minutes, max capacity (1–200), price (0 for free, or a positive amount), and location (inherited from centre or overridable)
- [ ] Trainer can set a class as one-off or recurring (weekly, bi-weekly, or monthly); recurring classes generate individual class instances up to 3 months in advance
- [ ] Trainer can edit all fields of a future class; past classes are read-only
- [ ] For recurring classes, trainer can choose to edit "this occurrence only" or "this and all future occurrences"
- [ ] Trainer can cancel a class (with a required cancellation reason); cancelled classes are hidden from athletes but appear as cancelled in trainer's history
- [ ] Capacity limit is enforced: once a class reaches max capacity, it no longer accepts new bookings (shows "Full")
- [ ] Trainer sees their classes in a list/calendar view with: title, date/time, booked/capacity count, status
- [ ] Centre admin has read-only view of all classes across their centre's trainers

## Edge Cases
- What if a trainer tries to schedule two classes at the same time? → Allow it (trainer may be co-teaching or error is theirs to manage); show a warning only.
- What if a trainer cancels a class that already has bookings? → All booked athletes are notified (via PROJ-8); any paid bookings are automatically refunded (via PROJ-6).
- What if the recurring class generation date range conflicts with a trainer being deactivated? → Stop generating new instances from the deactivation date; existing future instances remain.
- What if a trainer edits capacity to a number lower than current bookings? → Show error: "Cannot reduce capacity below current number of bookings (X)."
- What if a class duration overlaps midnight? → Allow it; display correct start and end times spanning two days.

## Technical Requirements
- `classes` table with fields: id, trainer_id, centre_id, title, description, sport_type, starts_at, duration_minutes, capacity, price, status, recurrence_rule
- Recurring class instances stored as individual rows linked by a `recurrence_group_id`
- Sport types stored in a `sport_types` reference table (seeded on deploy)
- Classes with future `starts_at` are "upcoming"; classes with past `starts_at` are "past"

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
