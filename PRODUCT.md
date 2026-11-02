# Product

<!-- impeccable:product-schema 1 -->

> Written by an unattended Impeccable init run (a subagent working from the agreed SPEC.md and the 2026-11-01 grilling session). The user had no live question channel. Every fact here comes from those answers; anything marked *inferred* is an assumption to confirm.

## Platform

web (HTML/CSS/SVG rendered headlessly to a fixed 600×448 bitmap for an e-ink panel)

## Stack

Delegated. Plain HTML/CSS/SVG components written as JS template functions that take JSON props, rendered by headless Chromium (Playwright) and quantised to the panel's 7 inks in Node. Chosen because the renderer will run in a cloud service. The Pi Zero W only displays the bitmaps.

## Users

One person (the owner), standing in their bathroom in Brooklyn between 4am and 11am. They glance at the screen while brushing their teeth or getting ready. They don't touch it, except for 4 physical buttons.

## Product Purpose

A wall display that turns the morning into one composed screen: the weather and how it changes over the day, what's on the calendar, when to leave for the first in-person thing, sunrise and sunset, a note to self, and a weekly reminder to water the bathroom plants. Outside the morning window it shows a calm piece with no data. Success means the owner leaves the bathroom knowing their day, and now and then stops because the screen is beautiful.

## Positioning

Each morning a language model composes the screen from a fixed library of components, and one free canvas carries a daily "wow". It's the opposite of a dashboard that looks the same every day.

## Operating Context

- 5.7" Inky Impression e-ink panel, 600×448, 7 inks. A refresh takes about 30s and flashes the screen. The image stays up with no power.
- Read from about 1–2 m away, in bathroom light (*inferred*: mixed daylight and warm vanity light).
- Refreshes: the screen is composed once around 04:00, then the data is refilled every 30–60 min until 11:00. One ambient piece from 11:00 to 04:00.
- Buttons: A = watered, B = 👍 design, C = 👎 design, D = spare.

## Capabilities and Constraints

- Only 7 inks: no greys or tints, except through dithering. Antialiasing quantises away.
- Text has to be readable at arm's length. Thin strokes and tiny type don't survive.
- Data sources: work and personal Google calendars, weather for Fort Greene (Brooklyn), transit/travel time, and an authenticated note endpoint that other agents can post to.
- Plants: a single weekly reminder. It shows a day early, from Friday if it falls on a weekend, gets louder each day overdue, and resets on button A.

## Brand Commitments

- Binding visual reference from the user: Braun / Dieter Rams, "less but better". A strict grid, one grotesk typeface, lots of white space, and a single accent colour kept for things that need action.

## Evidence on Hand

No real data is wired in yet. Every preview uses synthetic Brooklyn weather and made-up meetings.

## Product Principles

1. You should be able to read it in a glance from across the room.
2. Accent colour means "do something".
3. Each morning should feel composed, not templated.
4. Quiet over busy. An empty slot beats a filler widget.
