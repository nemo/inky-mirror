# Design system: inky-mirror

The design language for a Braun-style e-ink instrument. The surface is a 600×448 Inky Impression 5.7" with 7 inks, read from about 1.5 m away in a bathroom. Source: `design/src/`. Previews: `previews/index.html`.

## World

Braun / Dieter Rams, "less but better". A white housing, black type set on a strict grid, and colour used the way Braun used its control buttons: a few dots, each with a job.

**Signature move: the grille.** Braun's speaker perforation is the data texture. The hourly temperature, the day's busy half-hours, the sun's arc and the ambient pieces are all drawn as fields of holes. A solid dot means a value; a 2×2 pixel hole means an empty slot.

## Inks (exact panel colours: UC8159 `SATURATED_PALETTE`)

| Token | Hex | Job |
|---|---|---|
| `--ink` | #393039 | Type and rules |
| `--paper` | #FFFFFF | Ground |
| `--orange` (`--accent`) | #B16A49 | Something to do: plants, an urgent leave-by time |
| `--red` | #9C484B | The needle: "now" |
| `--blue` | #3D3B5E | Water: rain hours, personal events |
| `--yellow` | #D0BE47 | Sun: fills only, never text (too light) |
| `--green` | #3A5B46 | Done or on: plants watered, G train |

There are no greys. The only grey is the `.checker` 1-pixel pattern. Gradients are allowed only inside a `[data-dither]` region.

## Type

One family: **Archivo** (variable weight and width, SIL OFL, bundled at `design/fonts/`). The width axis does the job a second typeface would.

| Token | Spec | Use |
|---|---|---|
| `--t-small` | 500 14/16, width 112% | Secondary lines, units, scale numbers |
| `--t-body` | 500 18/24 | Event titles, notes |
| `--t-title` | 650 24/32 | Dateline, module leads |
| `--t-display` | 700 44/48, width 88% | Key numbers: next event, leave-by |
| `--t-hero` | 750 96/88, width 88% | Temperature, poster words |
| `--t-giant` | 800 152/136, width 80% | Poster direction only |

Floors: nothing smaller than 14px, and nothing lighter than weight 500 below 20px. Modules narrower than 240px step `display` down to 32px. Times are 12-hour, with a small `am`/`pm`.

## Grid

24px margins. 12 columns of 35px with 12px gutters, and an 8px baseline. Areas are fixed pixel boxes (`design/src/templates.mjs`), so every component knows its exact size. Stacked modules are separated by 1px rules with 10px of space on each side. No cards, no shadows, no radii except dots.

## Templates (offered to the model)

`rail` · `poster` · `strip` · `dial` · `quiet`, plus `full` for ambient. `sheet` and `sheet2` are internal and used only for the contact sheet.

## Components: `(props, box) => html`

`dateline`, `weather` (compact | full | field), `nextEvent`, `calendar` (list | timeline | dial), `daylight`, `travel`, `plants`, `note`, `poster`, `line`, `canvas`. The props for each are documented above its function in `design/src/components.mjs`. Components never fetch data or read the clock. Times arrive as `"HH:MM"`.

`plants` gets louder as it escalates: done (green dot), then upcoming (an ink line), weekend (an orange line, shown from Friday), due (an orange block), and overdue 1–3 (a block that grows and gains one dot per day late).

## Contract for phase 2: Sonnet → renderer

Sonnet returns one screen as JSON:

```json
{
  "template": "rail",
  "slots": {
    "header": { "component": "dateline", "props": { "date": "2026-11-05", "place": "Fort Greene", "updated": "06:50" } },
    "main":   { "component": "weather", "variant": "field", "props": { "...": "..." } },
    "rail":   [ { "component": "nextEvent", "props": {} }, { "component": "plants", "props": {} } ]
  }
}
```

- An array in a slot stacks its components with rules between them.
- `compose.validate()` rejects unknown templates, areas and components. `render.mjs` flags any slot whose content overflows its box. The service should retry or fall back when either happens.
- The data service fills in the props. Sonnet chooses the template, components, variants and copy (poster text, `canvas.svg`), not the facts.
- `canvas` takes Sonnet's free SVG. It still needs a sanitiser that allows only palette colours and has no scripts and no external references. That isn't built yet.
- Examples: `design/fixtures/*.json`.

## Rendering

`cd design && node render.mjs`. Headless Chromium renders at 1×. `quantise.mjs` then snaps each antialiased pixel to whichever of its two blended inks it mostly is, with a bias toward ink so 1px rules and small type survive. `[data-dither]` regions use Floyd–Steinberg instead. Phase 2 should push the palette indices straight to the panel. The current `image.py` uses `set_image(saturation=0.5)`, which would re-quantise against a blended palette.

## Panel calibration (real Inky Impression 5.7", 2026-11-01, warm incandescent light)
- Colour reads only at **≥ 8px** marks. Blue and green below 8px read as black; red reads at any size.
- Blue renders as blue-violet; black has a slight purple cast.
- Orange renders coral, too close to red. Never use both on one screen.
- Yellow is pale: always give it an ink outline.
