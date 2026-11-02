# inky-mirror v2 — spec

Agreed 2026-11-01 (grilling session). Bathroom e-ink display that is informational
in the morning and artistic the rest of the day.

## Hardware (as found)
- Raspberry Pi Zero W (ARMv6, 427 MB RAM), Raspbian 12, Python 3.11
- Pimoroni Inky Impression 5.7" — 600×448, 7 colours (black, white, red, green,
  blue, yellow, orange), ~30 s full refresh
- 4 buttons on GPIO 5, 6, 16, 24 (A–D)
- inky lib lives in `~/.virtualenvs/pimoroni`

## Architecture
- **Cloud service** (e.g. Cloud Run) owns everything: data fetch, Sonnet call,
  rendering to a 600×448 PNG quantised to the 7-colour palette.
- **Pi is a thin client**: polls the service for the current image, pushes to the
  display only when the image hash changes, and POSTs button presses back.
- Replaces the current cron → wkhtmltoimage → halfmoon.ws screenshot pipeline.

## Modes
| Window | Mode | Behaviour |
|---|---|---|
| 04:00–11:00 | Morning | Sonnet composes the layout once (~04:00). Data slots (weather, next event, now-marker) re-render every 30–60 min without a new model call. |
| 11:00–04:00 | Ambient | One calm, data-free piece generated once per day. |

## Composition model
- Sonnet returns **JSON**: a grid template + chosen components + parameters
  (emphasis, variants) + short copy.
- A deterministic renderer draws it. Layouts must always fit.
- One **free canvas slot** (SVG / typography) for the daily "wow", validated for
  size and palette.
- Sonnet chooses the wow mode each morning.

### Direction ideas to rotate (user gives feedback over time)
1. Instrument panel — the day as a Braun radio dial
2. Swiss poster — one dominant fact, set big
3. Weather abstraction — rain as vertical rules, temperature as a colour field
4. Aicher-style timeline strip of the day
5. Quiet day — nearly empty, one word, one dot

## Components
- Weather + the day's hourly shape
- Calendar: work (Pearmill) + personal Google. First 2–3 events in full, the rest
  summarised. Filter declined events and others' all-day OOO.
- Sunrise / sunset / daylight
- Travel time from home to the first in-person event
- Plant watering reminder
- Note to self — authenticated API endpoint so the user **and other agents** can
  post a note for the next morning

## Plants
- One weekly "water the plants" reminder (no per-plant tracking).
- Starts showing a day early; if due on a weekend, starts Friday.
- Escalates visually each day overdue.
- A button press marks watered; next due = press date + 7 days.

## Buttons
- A: watered
- B: 👍 today's design
- C: 👎 today's design
- D: spare
- Feedback is logged with the day's direction so Sonnet can learn preferences.

## Visual language
Braun / Dieter Rams: strict grid, one grotesk family, lots of white space,
a single accent colour reserved for things needing action (plants, conflicts, rain).
UI work done with Impeccable (`.claude/skills/impeccable`).

## Config (not committed)
Home location, API keys, calendar credentials live in env / secret config.
