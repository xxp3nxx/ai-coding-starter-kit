# Product Requirements Document

## Vision
FitClass is a scheduling platform that gives fitness centres and their trainers a seamless, automated way to manage classes, while offering recreational athletes an effortless way to discover, book, and attend those classes. By automating capacity management, waitlists, reminders, and payments, FitClass eliminates the administrative burden that has traditionally made running and attending fitness classes stressful.

## Target Users

### Fitness Centres (B2B Admin)
Gyms, studios, and sports facilities that manage multiple trainers, rooms, and class schedules. Their pain points: time wasted on manual scheduling, overbooking, and chasing payments. They need a single dashboard to oversee their entire operation.

### Course Trainers (B2B Staff)
Individual instructors employed by or associated with a fitness centre. They create and manage their own class schedules under the centre's umbrella. Pain points: manual attendance tracking, last-minute cancellations, and no-shows.

### Recreational Athletes (B2C End Users)
Hobby athletes looking for local fitness classes to join. Pain points: finding the right class at the right time, complex booking processes, and not knowing if a class still has availability.

## Core Features (Roadmap)

| Priority | Feature | Status | ID |
|----------|---------|--------|----|
| P0 (MVP) | User Authentication & Roles | Planned | PROJ-1 |
| P0 (MVP) | Fitness Centre Management | Planned | PROJ-2 |
| P0 (MVP) | Class Scheduling (Trainer) | Planned | PROJ-3 |
| P0 (MVP) | Class Discovery & Search | Planned | PROJ-4 |
| P0 (MVP) | Booking & Cancellation | Planned | PROJ-5 |
| P0 (MVP) | Payments (Stripe) | Planned | PROJ-6 |
| P1 | Waitlist Management | Planned | PROJ-7 |
| P1 | Notifications & Reminders | Planned | PROJ-8 |
| P1 | Trainer & Centre Dashboard | Planned | PROJ-9 |

## Success Metrics
- **Booking conversion rate:** ≥ 60% of class page views result in a booking
- **Class fill rate:** Average class occupancy ≥ 70% within 30 days of launch
- **Centre onboarding:** ≥ 5 fitness centres onboarded in first 3 months
- **Churn reduction:** < 10% of centres cancel within the first 6 months
- **Waitlist effectiveness:** ≥ 80% of waitlisted spots are filled when cancellations occur

## Constraints
- Small team (1–2 developers)
- Greenfield build — no legacy system to integrate with
- Payments via Stripe only (no custom payment processing)
- MVP must be deployable on Vercel + Supabase (no dedicated servers)

## Non-Goals
- Native mobile apps (web-first; responsive mobile browser is sufficient for MVP)
- Multi-language / internationalization in MVP
- Subscription/membership pass management (e.g. 10-class packs) — post-MVP
- Video streaming or on-demand class content
- In-platform messaging between athletes and trainers
