First save this whole message as docs/coach-dashboard.md, then build it. Read the project knowledge first; keep every route, rule, word and safety rule as they are.

# Room for Mama: coach dashboard

## Purpose
She runs the practice in a few minutes a day. The dashboard shows her what is happening and asks only for the decisions a person has to make: join the call, say yes or no after a hello call, confirm a payment. Everything else runs by itself. A normal day needs no taps except Join.

## Shape
- Login as today (coach role only). /demo/coach shows the same dashboard without login on demo rows, opening on Wednesday 14 October 2026, with a small note "Demo: sample mothers, nothing is sent."
- Desktop: a 240 px left sidebar (logo, tabs with brand icons, the round day/night toggle at the bottom), content up to 1200 px. Phones: app-style with a bottom tab bar (Today, Calendar, Mothers, More → Rules, Given back) and a sticky main action.
- Tabs and icons: Today (icon-half-hour), Calendar (icon-time), Mothers (icon-hello-call), Rules (icon-notes), Given back (icon-time-given-back). A butter count badge on Today shows how many things need her.

## Today
- Greeting line: "Good afternoon. 3 calls today." with the date in Lahore.
- Next call card: butter with the offset print. Mother’s first name, "Hello call" or "Make Room 2 of 4", the time in Lahore and her local time and city, "in 25 min", then Join (icon-video-call, her Meet link) and Baby’s up (sends that mother 3 new times; she types nothing).
- Needs you: exceptions only, one tap each, each with its reason in plain words:
  - A payment to check: RM reference, amount, method, "held until …" → Confirm / Not received yet.
  - A third move on one call → Offer new times / Cancel kindly.
  - A missed call → Mark missed (the first missed Make Room call is put back automatically) / Offer a new time.
  - A call on a day she took off → Offer new times.
- After a hello call ends, a card asks "How was your hello call with Sara?" → Offer Make Room / Not a fit (sends her Not a fit note from Rules). After any call, an optional one-line "Small step" that goes into the thank-you email.
- The day: every call today in order, done (sage tick), next, later, with each mother’s local time.
- This week, in one row: calls booked, calls moved by mothers, time given back (estimated).

## Calendar
- Week view by default (Mon–Fri; weekends only if a call is on them) and a month view.
- Lahore time down the side. Her two windows (14:00–17:00 and 21:00–23:00) are paper bands; the rest of the day is sunk, so open time is obvious at a glance.
- Each call is a card in its slot: first name, "Hello call" or "Make Room 2 of 4", her local time with city ("11:30 am, Manchester"). Hello calls sage-soft; Make Room butter-soft; a held, unpaid time butter-soft with a dashed edge and "Held"; a moved call shows icon-move. The next call is butter with the offset print. A thin ink line with a butter dot marks now.
- Month view: small dots and the number of calls on each day; tap a day for its list.
- Tap a call: a side sheet on desktop, a bottom sheet on phones: Join, Baby’s up, payment status, the MakeRoomTimeline, private notes, Share helplines.
- Take time off: she picks days; no new times are offered on them, and calls already booked there go to Needs you.
- Add to my calendar: a private feed link (a random secret token of 32+ characters serving an .ics of all her upcoming calls with the Meet link) to subscribe to in Google or Apple Calendar, with "Make a new link" to replace it.
- Phones: a 3-day view you swipe. Empty days: illo-tea-cold with "No calls. A little room for you."

## Mothers
- A list with search and filters (Hello call booked, Make Room, Waitlist, Finished, Paused, Payment waiting). Each row: first name, city and time zone, a status chip, next call.
- A mother’s page: email and optional phone; her time zone and the days, times and city she gave (never her words); upcoming and past calls; the MakeRoomTimeline; payments (RM reference, amount, method, status); moves used by each side; private notes (coach only); Share helplines (one tap emails her country’s lines); Pause (up to 8 weeks) or Cancel with the refund rule; Delete her data.
- No health details, questionnaires, mood tracking or scores anywhere.

## Rules
Every setting in plain words with its current value and a Save that says "Saved": working days and windows, calls per day, buffer, notice for new calls and moves, weeks ahead, call lengths, prices by zone and the founding price with how many founding places are left, payment details (bank, Raast, JazzCash, Wise), her Meet link, Keep my spot timing, moves per side, pause length, the Not a fit note, days off, the calendar feed link, the digest time (07:00 Lahore), minutes saved per action, and the helplines table. Real details live only here, never in code.

## Given back
Week, month and all-time totals of minutes saved, labelled "estimated", a simple weekly bar chart, and a feed of what ran by itself ("07:02 Sent Sara her reminder · 5 min"). "Run today’s automations now" sits here.

## What reaches her without opening the app
- The 07:00 Lahore digest: today’s calls with local times and Join links, and anything in Needs you.
- The calendar invite for every booking and move, plus the calendar feed.
- An email when a payment has waited more than 24 h. Nothing else.

## Look
Same tokens, fonts, icons and night mode as the rest of the app. The offset print in the coach app is butter and only on the next call and Needs you. Cards radius 22, 48 px tap targets, nothing bounces, reduced motion respected. Words: mothers, calls, half hours; never clients, sessions or appointments.

## Security
Coach role only on every coach table, RLS everywhere, private notes coach-only, the feed token random and replaceable, payment details and the Meet link only in settings.

## Check before you finish
Walk through /demo/coach on desktop and phone, by day and at night: Today, a payment confirm, an after-call Offer Make Room, the Calendar in week and month view, time off moving a call to Needs you, the feed downloading a valid .ics, a mother’s page, Rules saving, Given back. Keep all existing tests passing.