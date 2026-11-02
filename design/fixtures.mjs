// Synthetic preview data: a week of mornings in Fort Greene, Brooklyn.
// None of this is real calendar or weather data.

const hoursFrom = (temps, rain) => temps.map((t, i) => ({ h: 6 + i, t, p: rain[i] ?? 0 }));

const MON = {
  date: "2026-11-02",
  weather: {
    now: 48, condition: "Cloudy", summary: "Rain 3 to 7pm", hi: 57, lo: 46,
    hours: hoursFrom(
      [46, 46, 47, 49, 51, 53, 55, 56, 57, 56, 54, 52, 51, 50, 49, 48, 47],
      [0, 0, 0, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.2, 0.1, 0, 0]
    ),
  },
  events: [
    { start: "09:30", end: "10:00", title: "Pearmill standup", where: "Zoom" },
    { start: "11:00", end: "12:00", title: "Flux weekly", where: "Zoom" },
    { start: "13:00", end: "14:00", title: "Lunch with Sam", where: "Walter's, Fort Greene", personal: true },
    { start: "15:00", end: "15:45", title: "Better pacing review", where: "Meet" },
    { start: "16:30", end: "17:30", title: "Hiring panel", where: "Zoom" },
    { start: "19:30", end: "21:00", title: "Dinner at Olea", where: "Lafayette Ave", personal: true },
  ],
  daylight: { sunrise: "06:31", sunset: "16:46", now: "06:40" },
};

const header = (date, updated = "06:40") => ({ component: "dateline", props: { date, place: "Fort Greene", updated } });

export const SCREENS = [
  /* 1. Instrument panel: the day as a radio tuning scale */
  {
    name: "dir1-instrument",
    label: "Direction 1 · Instrument panel",
    template: "dial",
    slots: {
      header: header(MON.date),
      scale: { component: "calendar", variant: "dial", props: { events: MON.events, now: "06:40", from: 6, to: 22 } },
      a: { component: "weather", variant: "compact", props: MON.weather },
      b: { component: "daylight", props: MON.daylight },
      c: { component: "plants", props: { state: "due", due: MON.date } },
    },
  },

  /* 2. Swiss poster: one dominant fact */
  {
    name: "dir2-poster",
    label: "Direction 2 · Swiss poster",
    template: "poster",
    slots: {
      header: header("2026-11-04", "06:35"),
      poster: { component: "poster", props: { text: "Rain from three.", sub: "Take the umbrella to Industry City.", ink: "ink" } },
      a: { component: "travel", props: { to: "Industry City", leaveBy: "09:12", minutes: 31, line: "G", urgent: false } },
      b: { component: "nextEvent", props: { title: "Offsite with Flux", start: "10:00", inMinutes: 205, where: "Industry City" } },
      c: { component: "plants", props: { state: "upcoming", due: "2026-11-08" } },
    },
  },

  /* 3. Weather abstraction: temperature as a colour field, rain as rules */
  {
    name: "dir3-weather-field",
    label: "Direction 3 · Weather abstraction",
    template: "rail",
    slots: {
      header: header("2026-11-05", "06:50"),
      main: {
        component: "weather", variant: "field",
        props: {
          now: 51, condition: "Rain", summary: "Wet until noon, then clearing", hi: 60, lo: 50,
          hours: hoursFrom(
            [50, 50, 51, 52, 53, 55, 57, 58, 60, 60, 59, 57, 55, 54, 53, 52, 51],
            [0.9, 0.9, 0.8, 0.8, 0.7, 0.6, 0.4, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0]
          ),
        },
      },
      rail: [
        { component: "nextEvent", props: { title: "Pearmill standup", start: "09:30", inMinutes: 160, where: "Zoom" } },
        { component: "note", props: { text: "Call the super about the radiator.", from: "Nima", at: "23:12" } },
        { component: "plants", props: { state: "overdue", due: "2026-11-03", daysLate: 2 } },
      ],
    },
  },

  /* 4. Aicher timeline: the day as a measured band */
  {
    name: "dir4-timeline",
    label: "Direction 4 · Timeline strip",
    template: "strip",
    slots: {
      header: header("2026-11-06", "07:10"),
      tl: { component: "weather", variant: "compact", props: { ...MON.weather, now: 44, summary: "Bright and cold", hi: 52, lo: 41, hours: hoursFrom([41, 42, 43, 45, 47, 49, 50, 51, 52, 52, 51, 49, 47, 46, 45, 44, 43], []) } },
      tr: { component: "daylight", props: { sunrise: "06:35", sunset: "16:42", now: "07:10" } },
      band: { component: "calendar", variant: "timeline", props: { events: MON.events.slice(0, 5), now: "07:10", from: 7, to: 21 } },
      bl: { component: "calendar", variant: "list", props: { events: MON.events.slice(0, 5), max: 2, detail: false, from: 7, to: 19 } },
      br: { component: "plants", props: { state: "weekend", due: "2026-11-08" } },
    },
  },

  /* 5. Quiet day: one word, one dot */
  {
    name: "dir5-quiet",
    label: "Direction 5 · Quiet day",
    template: "quiet",
    slots: {
      canvas: { component: "canvas", props: { gen: "quiet", word: "Clear.", dot: "yellow" } },
      footer: { component: "line", props: { text: "Saturday 7 November · 52° to 61° · Dinner at 7:30 · Plants tomorrow" } },
    },
  },

  /* Ambient pieces */
  { name: "ambient-grille", label: "Ambient · Grille", template: "full", slots: { canvas: { component: "canvas", props: { gen: "grille", seed: "2026-11-02" } } } },
  { name: "ambient-sunpath", label: "Ambient · Sun path", template: "full", slots: { canvas: { component: "canvas", props: { gen: "sunpath", seed: "2026-11-03" } } } },

  /* Component sheets */
  {
    name: "sheet-plants",
    label: "Sheet · Plant reminder states (quiet → loud)",
    template: "sheet",
    slots: {
      all: [
        { component: "plants", props: { state: "done", due: "2026-11-08", wateredOn: "Sunday" } },
        { component: "plants", props: { state: "upcoming", due: "2026-11-08" } },
        { component: "plants", props: { state: "weekend", due: "2026-11-08" } },
        { component: "plants", props: { state: "due", due: "2026-11-08" } },
        { component: "plants", props: { state: "overdue", due: "2026-11-08", daysLate: 1 } },
        { component: "plants", props: { state: "overdue", due: "2026-11-08", daysLate: 3 } },
      ],
    },
  },
  {
    name: "sheet-weather",
    label: "Sheet · Weather full + calendar list",
    template: "sheet2",
    slots: {
      left: { component: "weather", variant: "full", props: MON.weather },
      right: { component: "calendar", variant: "list", props: { events: MON.events, max: 4, from: 7, to: 21 } },
    },
  },
  {
    name: "sheet-modules",
    label: "Sheet · Next event, travel, note, daylight",
    template: "sheet2",
    slots: {
      left: [
        { component: "nextEvent", props: { title: "Pearmill standup", start: "09:30", inMinutes: 42, where: "Zoom" } },
        { component: "travel", props: { to: "Industry City", leaveBy: "08:52", minutes: 31, line: "G", urgent: true } },
        { component: "note", props: { text: "Flux report is drafted. Review before 10.", from: "Claude (Flux agent)", at: "02:14" } },
      ],
      right: [
        { component: "daylight", props: MON.daylight },
        { component: "travel", props: { to: "Walter's", leaveBy: "12:48", minutes: 9, mode: "walk" } },
      ],
    },
  },
];

/* Colour treatments, rendered on direction 3 and the plant-states sheet */
import { THEMES } from "./src/lib.mjs";
const byName = (n) => SCREENS.find((x) => x.name === n);
for (const [t, def] of Object.entries(THEMES)) {
  for (const base of ["dir3-weather-field", "sheet-plants"]) {
    const src = byName(base);
    SCREENS.push({ ...src, name: `var-${t}-${base.replace("dir3-weather-field", "dir3").replace("sheet-plants", "plants")}`, label: `Colour · ${t}: ${def.label} · ${base.startsWith("dir3") ? "Direction 3" : "Plant states"}`, theme: t });
  }
}

/* template outlines for the contact sheet */
export const TEMPLATE_SHEETS = ["rail", "poster", "strip", "dial", "quiet"];
