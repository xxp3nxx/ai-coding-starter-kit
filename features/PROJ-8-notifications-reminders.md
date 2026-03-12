# PROJ-8: Notifications & Reminders

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-5 (Booking & Cancellation) — booking events trigger notifications
- Requires: PROJ-7 (Waitlist Management) — waitlist promotions trigger notifications

## Overview
Athletes receive automated email notifications at key moments: booking confirmation, class reminders, cancellation notices, and waitlist promotions. This removes the manual communication burden from trainers and ensures athletes never miss a class.

## User Stories
- As an athlete, I want to receive a confirmation email immediately after booking a class so that I have proof of my reservation.
- As an athlete, I want to receive a reminder email 24 hours before a class so that I don't forget.
- As an athlete, I want to receive an email if a class I'm booked into is cancelled so that I can adjust my plans.
- As an athlete, I want to receive an email when I am promoted from the waitlist so that I can act quickly to confirm my spot.
- As a fitness centre admin, I want all notifications to be sent from a branded email address (or at minimum, reference the centre name) so that athletes trust the communication.

## Acceptance Criteria
- [ ] **Booking confirmation:** Email sent immediately after a booking is confirmed (post-payment for paid classes)
  - Contains: class name, trainer name, centre name, date/time, location, and a cancellation link
- [ ] **Class reminder:** Email sent 24 hours before the class starts to all confirmed attendees
  - Contains: class name, date/time, location, and a "View booking" link
- [ ] **Class cancellation (by trainer/centre):** Email sent immediately to all booked athletes when a class is cancelled
  - Contains: class name, cancellation reason, and refund confirmation (if paid)
- [ ] **Waitlist promotion (paid class):** Email sent immediately when athlete is promoted from waitlist
  - Contains: class name, date/time, price, and a "Confirm & Pay" link (valid for 30 minutes)
- [ ] **Waitlist promotion (free class):** Email sent immediately confirming the athlete's spot is now confirmed
- [ ] **Waitlist offer expired:** Email sent if athlete fails to pay within 30 minutes — "Sorry, your spot was given to the next person"
- [ ] **Booking cancellation (by athlete):** Confirmation email sent to athlete after they cancel their own booking
  - Contains: refund details if applicable
- [ ] All emails use a consistent design template with the platform name and (optionally) the centre's name
- [ ] Emails are sent reliably; failed sends are retried up to 3 times

## Edge Cases
- What if the athlete unsubscribes from emails? → MVP: no unsubscribe for transactional emails (booking confirmations, cancellations are required); reminder emails should respect an opt-out preference.
- What if the class reminder fires for a class that was just cancelled? → Check class status before sending; suppress reminder if class is cancelled.
- What if the athlete has no email address on file? → Block booking if email is missing; require email at registration.
- What if many athletes are booked into a cancelled class (e.g. 50 people)? → Batch send emails; do not send individually in serial to avoid timeouts.
- What if the email provider (e.g. Resend) is temporarily down? → Queue the emails and retry; log failures for manual follow-up.

## Technical Requirements
- Email delivery via Resend (or similar transactional email provider)
- Email templates rendered server-side (React Email or plain HTML)
- `notification_log` table: id, type, recipient_email, class_id, booking_id, sent_at, status (sent / failed)
- Class reminder job runs every hour via Supabase Edge Function cron (checks for classes starting in ~24 hours)
- All notification triggers are idempotent (safe to retry without duplicate emails)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
