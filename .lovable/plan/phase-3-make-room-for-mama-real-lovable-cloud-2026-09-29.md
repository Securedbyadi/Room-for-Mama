# Phase 3: make Room for Mama real (Lovable Cloud)

The six screens stay as they are. Behind them, demo arrays are replaced by saved data. Demo mode ("Try it as a mama in Manchester", demo coach) keeps using demo data only and never touches the real calendar.

## What the mother gets
- Hello call booking saves for real: the offered times come from the coach's real calendar, the Book button saves the call, "You're in" shows it, and the confirmation plus .ics are prepared.
- Waitlist saves only first name, email, days, times and city. When a time opens, the first person waiting gets it.
- Manage link (a private link, no login): see calls, Baby's up move (free, twice per call, until 10 min after start), pay, cancel.
- Make Room: "Book all four" holds the four times for 48 h, shows payment details, "I've paid" with a reference (RM + number). Unpaid holds release.
- Privacy page: what is kept, why, and how to delete it (one tap from the manage link).
- The "quiet moment" message is read by Lovable AI; only days, times and city are kept, never her words.

## What the coach gets
- Sign in (email and password, plus Google). Only the coach role sees the coach app.
- Today, Mothers, Rules, Given back read and write real data. Rules edits windows, prices, notice, Meet link, payment details, Not a fit note and the helplines table.
- Needs you: payment checks, third moves, missed calls, one tap each.
- Private notes kept separately, coach only.

## Automations
- Every 5 minutes: reminders, Keep my spot links, releasing spots to the waitlist, ending expired holds. 07:00 Lahore: the coach's digest. Each writes to the Time given back log with the brief's minutes.
- Emails still show on the preview page (no email domain yet); each automation adds the email there instead of sending it.

## Safety and integrity
- The database itself refuses double-booking on the coach's calendar.
- Every table locked by default; visitors never read tables directly. Mother actions go through the server and check the private link.
- Rate limits: 5 bookings per email, 20 per connection, per hour.
- SafetyNote and helplines unchanged, now loaded from the editable table.

## Build order
1. Tables, locks, coach role, seed settings and helplines.
2. Coach sign-in and coach app on real data.
3. Hello call booking, waitlist, manage link, Baby's up.
4. Make Room hold and payment.
5. Automations and Time given back.
6. Privacy page, tests, full browser walkthrough.

## Technical details
- Tables: settings (single row), helplines, mothers, calls (exclusion constraint on tstzrange with 10 min buffer, excluding cancelled), plans, payments, waitlist, move_log, private_notes, automation_log, email_outbox, user_roles + has_role. RLS on all; coach policies via has_role(auth.uid(),'coach').
- Server functions (createServerFn) for all mother actions, using the admin client only after validating the manage token (32+ random chars, stored hashed). Coach functions use requireSupabaseAuth.
- Time engine stays the single source for slots; the server feeds it busy calls from the database.
- Cron: /api/public/hooks/tick (every 5 min) and /api/public/hooks/digest (daily 02:00 UTC), guarded by a generated secret.
- Placeholders (Meet link, payment details, coach email) seeded as settings the coach edits in Rules.
