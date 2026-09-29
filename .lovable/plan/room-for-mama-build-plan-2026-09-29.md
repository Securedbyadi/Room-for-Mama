# Room for Mama — build plan

Approved order: Phase 0 → time engine + tests → all six screens on demo data → Lovable Cloud (tables, real bookings, emails).

Placeholders for Meet link, payment details and coach email (coach fills them in Rules later). No email domain yet — emails show as a preview page. "Not a fit" note is final copy (below).

## Phase 0 — look and shared pieces (done)
- Day/night colour tokens, Fraunces (SOFT 100, WONK 1) + Figtree, offset print, radii, motion, reduced motion.
- Shared components: Logo, Icon, Drawing, Button, Slot, MomentField, BookedCard, BabysUpSheet, MakeRoomTimeline, NeedsYouCard, TimeGivenBack, SafetyNote, Page.
- Favicon, manifest, app icon, fonts in the root route.

## Phase 1 — time engine (done)
- Pure TypeScript module `src/lib/time-engine.ts`: zones, windows, buffers, slot finding, weekly planning, clock changes, Baby's up options, formatting.
- Vitest suite with the plan's six test cases — all passing.

## Phase 2 — six screens on demo data (in progress)
Mother's flow:
1. Home (`/`) — hero, drawing, "Book a free hello call". Done.
2. Pick a time (`/book`) — quiet-moment question, "Try it as a mama in Manchester", 3 offered times, name/email/phone form. Done on demo data.
3. You're in (`/booked`) — confirmation, Add to my calendar (.ics), Baby's up sheet. Done on demo data.
4. Make Room (`/make-room`) — all 4 weekly calls at one time, clock-change notes, "Book all four", held state with placeholder payment details, "I've paid" with reference.
5. Baby's up — sheet with up to 3 new times, "Move my call", third move goes to Needs you (demo state).
6. Email preview page (`/emails`) — the branded template rendered for each email kind (confirmation, Keep my spot, reminder, thank-you, offer, Not a fit), since no email domain yet.

Coach app (demo data, no login yet):
- Today (`/coach`) — her calls in her time with each mother's local time, her own Baby's up, Needs you exceptions, "Offer Make Room" / "Not a fit", one-line small step.
- "Not a fit" note (final): "Thank you for the hello call. I don't think Make Room is the right fit for you just now, and I'd rather say so kindly than take your time or money. If you ever want another chat, I'm here."

Demo rules: demo rows only, never the real calendar or email; no real people.

## Phase 3 — Lovable Cloud (after the screens work)
- Enable Lovable Cloud; tables: settings (Meet link, payment details, coach email, minutes), mothers, calls, plans, payments, waitlist, private notes, automation_log, helplines (seeded).
- RLS on every table; visitors never read tables; mother actions via server functions checking the manage token (random, 32+ chars); no-double-booking constraint; rate limits (5 bookings/email, 20/IP per hour).
- Real bookings, manage link, privacy page; Lovable AI for the quiet-moment extraction (store only days/times/city).
- Emails via Lovable Cloud from hello@roomformama.com once the domain is set up (skipped for now).
- 5-minute job (reminders, Keep my spot, releases, expired holds) and 07:00 Lahore digest; automation_log minutes as listed.
- Coach login, Mothers/Rules/Given back tabs, Time given back totals, "Run today's automations now".

## Waiting on the coach (placeholders until then)
- Google Meet link, payment details (bank, Raast, JazzCash, Wise), coach login email — all editable later in Rules.
- roomformama.com email domain — skipped for now.
