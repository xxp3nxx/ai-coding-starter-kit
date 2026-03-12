# PROJ-4: Class Discovery & Search

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-3 (Class Scheduling) — classes must exist to be discovered

## Overview
Recreational athletes browse and search for available classes. This is the primary public-facing surface of the platform — it must be fast, easy to filter, and work without requiring a login.

## User Stories
- As an athlete, I want to browse all upcoming classes without needing to log in so that I can explore the platform before committing to registration.
- As an athlete, I want to filter classes by sport type so that I only see relevant options.
- As an athlete, I want to filter classes by date/time range so that I can find classes that fit my schedule.
- As an athlete, I want to filter classes by fitness centre so that I can find classes near me or at a centre I trust.
- As an athlete, I want to see a class detail page with all relevant information (trainer, centre, time, duration, price, spots left) so that I can make a booking decision.
- As an athlete, I want to see which classes are full or have limited spots so that I can plan accordingly.

## Acceptance Criteria
- [ ] Class listing page is publicly accessible (no login required)
- [ ] Each class card shows: title, trainer name, centre name, date/time, duration, sport type, price, and spots remaining
- [ ] Filter options: sport type (multi-select), date range (date picker), time of day (morning/afternoon/evening), fitness centre (dropdown), and price range (free / paid / any)
- [ ] Filters are combinable and update results in real time (or on submit)
- [ ] Class detail page shows full description, trainer bio snippet, centre address, and a "Book Now" button
- [ ] "Book Now" button prompts unauthenticated users to log in or register; authenticated athletes proceed to booking
- [ ] Classes with 0 spots remaining show "Full" with an option to join the waitlist (PROJ-7)
- [ ] Cancelled classes are not shown in search results
- [ ] Results are sorted by date/time ascending by default
- [ ] Page loads within 2 seconds for up to 500 class results

## Edge Cases
- What if there are no results for the applied filters? → Show "No classes found" message with a suggestion to clear filters.
- What if an athlete bookmarks a class detail page and the class is later cancelled? → Show a "This class has been cancelled" message on the detail page; do not show a 404.
- What if the class starts in less than 1 hour? → Still show the class but disable the "Book Now" button; show "Booking closed" label.
- What if a class is free (price = 0)? → Show "Free" badge instead of a price.
- What if an athlete searches with no filters? → Show all upcoming classes paginated (20 per page).

## Technical Requirements
- Server-side rendered class listing for SEO and fast initial load
- Filtering via query parameters (URL-shareable filter state)
- No login required for browsing and viewing class detail
- Class search queries use Supabase Postgres with indexed columns: sport_type, starts_at, centre_id, status

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
