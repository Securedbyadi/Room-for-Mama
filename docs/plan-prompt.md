Read the project knowledge first. Plan only, no code yet.

The attached screens (home, pick a time, You’re in, Make Room, Baby’s up at night, coach Today) are the visual target. Set up the colour variables, the two fonts (Fraunces with SOFT 100 and WONK 1, Figtree), night mode and the offset-print style from the Look section before building any screen. The logo, drawing and icon SVGs are in public/brand (or attached): use them as they are; never redraw or retype them. Add a web manifest (rfm-app-icon-192.png and -512.png) and rfm-app-icon-180.png as the apple-touch-icon, so the coach can add the app to her phone’s home screen. Build these parts once and reuse them: Logo, Icon, Drawing, Button, Slot, MomentField, BookedCard, BabysUpSheet, MakeRoomTimeline (four mugs), NeedsYouCard, TimeGivenBack, SafetyNote.

Plan the build in three phases, one feature per step:
1. Settings and data model, the time-zone and window engine, hello-call booking on the website (the quiet-moment question, AI extraction, 3 best times, the waitlist), confirmation email and calendar invites, the 5-minute job, Keep my spot and release. SafetyNote and the helplines go on every booking screen and email from the first build.
2. "Offer Make Room" → Make Room page with clock-change notes → book all four → payment hold and one-tap confirm → reminders with Baby’s up for both sides → manage link and privacy page.
3. Coach app (login, Today, Needs you, mothers, rules editor), automations and Time given back, night mode, demo controls, demo data.

Demo data: 5 weeks of sample calls (Lahore, Dubai, Manchester, Toronto), some moved, and 3 finished Make Room plans with Time given back history. The coach’s Wednesday 14 October 2026 matches the coach Today screen: Hina (Lahore, Make Room 2 of 4) at 14:30, Sara (Manchester, hello call) at 15:30 and Maryam (Dubai, Make Room 3 of 4, moved) at 21:00, all Lahore time, with Emily’s Make Room payment (RM1047, US$80) waiting in Needs you. "Try it as a mama in Manchester" fills in: "Most mornings when the baby naps, around 11. Not Mondays. I’m in Manchester."

Write the time-zone and window engine as pure functions with unit tests:
- Calls start on :00 or :30 only. Hello calls last 20 minutes, half hours 30, with a 10-minute buffer between calls.
- Hello call offers: Sara in Manchester, weekdays except Monday, 11:00–12:00 Europe/London, asks at 03:00 London on Mon 12 Oct 2026. Hina’s half hour is on Wed 14 Oct at 14:30 Lahore. Expected: Tue 13 Oct 11:00, Wed 14 Oct 11:30 (11:00 falls inside Hina’s buffer), Thu 15 Oct 11:00, all London.
- Make Room for Sara starts Tue 20 Oct 2026 at 11:00 London. Expected: 20 Oct, 27 Oct, 3 Nov, 10 Nov, all at 11:00 London; coach time 15:00 on 20 Oct, 16:00 from 27 Oct (UK clocks change 25 Oct).
- A mother in Toronto, weekdays 12:00–14:00 America/Toronto. Make Room starts Tue 27 Oct 2026 at 13:00 Toronto (22:00 Lahore). After US/Canada clocks change on 1 Nov, 13:00 Toronto would be 23:00 Lahore, outside the coach’s window. Expected: 27 Oct at 13:00 Toronto, then 3, 10 and 17 Nov at 12:00 Toronto, all at 22:00 Lahore, and she is told when she books.
- A call may end exactly when a window ends: 12:30 Toronto on 3 Nov (22:30 to 23:00 Lahore) is allowed.
- Baby’s up: Maryam in Dubai, weekdays 20:00–22:00 Asia/Dubai, has her half hour on Tue 13 Oct at 20:30 Dubai (21:30 Lahore) and taps Baby’s up at 20:00 Dubai. Other half hours: Tue 13 Oct 22:30, Wed 14 Oct 14:30, Thu 15 Oct 21:00 Lahore; Sara’s hello call Wed 14 Oct 15:30 Lahore. Expected: Wed 14 Oct 20:00, Thu 15 Oct 21:00, Fri 16 Oct 20:00, all Dubai, and nothing on Tue 13 Oct.
- Baby’s up returns at most 3 options, one per day, earliest first, at least 1 hour ahead, all inside both windows, none overlapping another call or its 10-minute buffer, never more than 3 calls on the coach’s day. After two moves by the same side it creates a Needs you item instead of offering times.

Use the words from the Feel and words section everywhere, table names included: mothers and calls, never clients or sessions.

Ask me anything unclear before starting.
