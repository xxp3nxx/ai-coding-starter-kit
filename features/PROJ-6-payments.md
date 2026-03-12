# PROJ-6: Payments (Stripe)

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-5 (Booking & Cancellation) — payment is triggered at booking time

## Overview
Athletes pay for paid classes at the time of booking via Stripe. When a booking is cancelled (by the athlete or by the trainer/centre cancelling the class), a refund is issued automatically. Fitness centres receive their earnings minus the platform fee.

## User Stories
- As an athlete, I want to pay for a class securely at the time of booking so that my spot is confirmed.
- As an athlete, I want to receive a refund automatically when I cancel a booking (within the cancellation window) or when a class is cancelled by the trainer.
- As an athlete, I want to see my payment history so that I can track my spending.
- As a fitness centre admin, I want to see revenue earned from classes on my platform so that I can track earnings.

## Acceptance Criteria
- [ ] For paid classes, a Stripe Checkout session is created at booking; athlete is redirected to Stripe to pay
- [ ] Booking is only confirmed after successful payment; if payment fails or is abandoned, the spot is not reserved
- [ ] After successful payment, athlete is redirected back to a booking confirmation page
- [ ] Free classes (price = 0) skip the payment step entirely
- [ ] Full refund is issued automatically when: (a) athlete cancels within the cancellation window, or (b) the trainer/centre cancels the class
- [ ] No refund is issued when: athlete cancels outside the cancellation window (configurable per centre; default: no refund after cutoff)
- [ ] Athlete can view their payment history (class name, date, amount paid, refund status) in their profile
- [ ] Centre admin can view a revenue summary (total bookings, total revenue, refunds issued) per class and per period

## Edge Cases
- What if the Stripe payment fails mid-checkout (e.g. card declined)? → Booking is not created; athlete is shown the Stripe error and can retry or use another card.
- What if a refund fails at Stripe's end? → Log the error; flag the booking for manual review; notify the centre admin.
- What if an athlete disputes a charge via their bank (chargeback)? → Stripe handles the chargeback flow; the booking is flagged in the system; out of scope for MVP automation.
- What if a class is partially cancelled (trainer cancels 1 occurrence of a recurring class)? → Refund is issued only for athletes booked on the cancelled occurrence.
- What if the platform fee percentage changes? → Apply the new rate only to new bookings; existing confirmed bookings retain the original rate.

## Technical Requirements
- Stripe Checkout for payment flow (no custom card form in MVP)
- Stripe webhooks to confirm payment success and process refunds
- `payments` table: id, booking_id, stripe_payment_intent_id, amount, currency, status, refunded_at
- Platform fee stored as a configurable environment variable (e.g. 5%)
- Stripe Connect (or manual payout) for centre payouts — MVP can use manual payouts; automated Connect is P1

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
