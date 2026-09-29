# Room for Mama: build plan

All brand files are already in public/brand (logos, 5 drawings, 23 icons, app-icon PNGs). They are used as they are, never redrawn. Words follow the Feel and words section everywhere, table names included (mothers, calls, plans, never clients or sessions).

## Phase 0: foundation (before any screen)

1. Look: colour tokens for day and night (night follows the phone), shadcn mapping (primary = main button, secondary/muted/accent = sunk, ring ink, border line, input line-strong, destructive clay). Fraunces (SOFT 100, WONK 1) and Figtree from Google Fonts, the type scale, radii, focus ring, motion (320 ms fades, sheet rise, steam drift, reduced motion).
2. Offset print: a single `offset` style, 2 px ink border and a hard 4 px shadow, peach on the website, butter in the coach app.
3. Home-screen: web manifest with rfm-app-icon-192/-512, apple-touch-icon 180, rfm-favicon. Manifest only, no offline mode.
4. Shared parts, built once: Logo (day/night swap), Icon (inlined SVG, currentColor), Drawing (always on a light paper card), Button, Slot, MomentField, BookedCard, BabysUpSheet, MakeRoomTimeline, NeedsYouCard, TimeGivenBack, SafetyNote (with country helplines).

## Phase 1: hello call booking

1. Lovable Cloud: settings (every rule in project knowledge, owner-editable), helplines table (seeded), mothers, calls, plans, payments, moves, waitlist, private_notes (coach only), automation_log, manage tokens. RLS on every table; visitors read nothing directly. A database constraint stops two calls overlapping (including buffer) on the coach calendar. Rate limits: 5 per email, 20 per IP, per hour.
2. Time engine as pure functions with unit tests covering every case in the brief (Sara's three offers, Make Room across the UK clock change, Toronto clock change moving to 12:00, a call ending exactly at 23:00, Maryam's Baby's up, one per day, max 3 a day, 6 h / 1 h notice, 6 weeks ahead).
3. Home page (screen 1), then the quiet-moment page (screen 2): her words go to Lovable AI, only days, times and city are kept; her zone detected with a Change link; 3 earliest times; waitlist when none fit.
4. Book: first name, email, optional phone, then "You're in" (screen 3).
5. Emails from hello@roomformama.com: one branded template, confirmation with calendar invite and video link; the coach gets the same invite. Nothing personal in subjects.
6. 5-minute job: Keep my spot links 24 h before, release at 3 h to the first on the waitlist, end expired holds. Each action writes automation_log.

## Phase 2: Make Room and moving

1. Coach "Offer Make Room" sends her the Make Room page (screen 4): four weekly times in both windows, clock-change notes, price by zone and founding price for the first 10.
2. Book all four: held 48 h, payment details (bank, Raast, JazzCash, Wise), "I've paid" with reference RM####, coach confirms in one tap, unpaid holds release.
3. Reminders 30 min before with Baby's up; the Baby's up sheet (screen 5) with up to 3 new times; moves update invites; twice per side, then a Needs you item.
4. Thank-you email with the small step after each call.
5. Manage link (token, no login): calls, move, pay, cancel (refund / pause rules). Privacy page.

## Phase 3: coach app

1. Coach login, tabs Today (screen 6), Mothers, Rules, Given back.
2. Today with each mother's local time, Join, her own Baby's up, Needs you exceptions, Offer Make Room / Not a fit, small step line.
3. Mothers: calls, payments, private notes, Share helplines. Rules editor for settings and helplines.
4. Time given back (week, month, all time, estimated) and feed; 07:00 Lahore digest; "Run today's automations now".
5. Demo: 5 weeks of sample calls in Lahore, Dubai, Manchester, Toronto, some moved, 3 finished plans, Wednesday 14 October matching screen 6 (Hina 14:30, Sara 15:30, Maryam 21:00 moved, Emily RM1047 US$80 in Needs you). "Try it as a mama in Manchester" fills the sample message. Demo rows never touch the real calendar or email.

## Things I need from you (placeholders until then)

- The coach's Google Meet link.
- Payment details: bank account, Raast ID, JazzCash number, Wise details.
- The coach's login email.
- Sending from hello@roomformama.com needs the roomformama.com domain set up for email; I'll open that step when we reach emails.
- The "Not a fit" note, or I'll draft one in her voice for you to edit.

## Technical notes

- TanStack Start with server functions for all mother actions (token checked server-side); scheduled jobs call protected public endpoints.
- Time engine in a pure module using Intl time-zone data, tested with Vitest.
- Calendar invites as .ics attachments.
