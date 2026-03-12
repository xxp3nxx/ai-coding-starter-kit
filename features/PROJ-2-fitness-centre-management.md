# PROJ-2: Fitness Centre Management

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1 (User Authentication & Roles) — centre admin role needed

## Overview
Fitness centres need to set up and manage their profile, invite trainers, and organise their team. This feature gives centre admins full control over their organisation's presence and personnel on the platform.

## User Stories
- As a fitness centre admin, I want to create and edit my centre's public profile (name, logo, address, description) so that athletes can find and trust my centre.
- As a fitness centre admin, I want to invite trainers by email so that they can join my centre and start managing classes.
- As a fitness centre admin, I want to view all trainers associated with my centre and their status (active / invited / inactive).
- As a fitness centre admin, I want to remove a trainer from my centre so that they can no longer create classes under my centre's name.
- As a trainer, I want to view which centre I belong to so that I understand my working context.

## Acceptance Criteria
- [ ] Centre admin can edit centre profile: name, logo (image upload), address, short description, and contact email
- [ ] Centre profile page is publicly visible to athletes (used in class listings)
- [ ] Centre admin can invite a trainer by entering their email address; an invitation email is sent to the trainer
- [ ] Invited trainer appears in the trainer list with status "Invited" until they accept
- [ ] Once the trainer accepts, their status changes to "Active"
- [ ] Centre admin can deactivate a trainer; deactivated trainers cannot create new classes but existing scheduled classes remain visible
- [ ] Trainer list shows name, email, status, and number of classes scheduled
- [ ] A trainer can only belong to one centre at a time (MVP)

## Edge Cases
- What if the centre admin invites an email that already has an active trainer account at another centre? → Show warning: "This trainer is already associated with another centre." Do not send the invite.
- What if the centre admin tries to remove a trainer who has classes scheduled in the future? → Show warning with list of upcoming classes; admin must confirm. Classes remain visible but become "orphaned" (show centre name, not trainer name).
- What if the centre admin uploads an image that is too large (>5MB)? → Show validation error; reject the upload.
- What if a trainer declines the invitation? → Trainer status is set to "Declined"; admin is notified; admin can re-invite.
- What if the centre admin edits the centre address after classes are already published? → Existing class listings automatically reflect the updated address.

## Technical Requirements
- Image upload stored in Supabase Storage (logos bucket)
- Centre profile data stored in `centres` table
- Trainer–centre relationship stored in `trainer_centres` junction table
- Invitation tokens expire after 7 days

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
