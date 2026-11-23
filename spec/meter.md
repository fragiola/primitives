# Meter

## Purpose

Shows a scalar measurement within a known range (the APG `meter` pattern): a disk's usage, a
battery's charge, a password's strength. It is not interactive and it is never indeterminate. How
far a task has gone is a [Progress](progress.md), not a Meter; a value the user chooses is a
[Slider](slider.md) or a [NumberField](number-field.md).

**Scope: stage 2** (Epic #52, Issue #50). The APG meter decides the role and its values; Base UI's
`Meter` (1.9) decides the parts and the default format (D4), as Progress's.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Meter.Root | `div` | `meter-root` | the `meter`; holds the value |
| Meter.Label | `span` | `meter-label` | names the Root (`aria-labelledby`) |
| Meter.Value | `span` | `meter-value` | shows the formatted value |
| Meter.Track | `div` | `meter-track` | the rail |
| Meter.Indicator | `div` | `meter-indicator` | the filled part, inside the Track |

One entry, `/meter` (D8), built on no other component; its value and format are the toolkit's
`/range` (`progressValue`, shared with Progress).

## API

**Meter.Root**:

- `value` (required): a number, clamped to `[min, max]`.
- `min` (`0`), `max` (`100`).
- `format` (`Intl.NumberFormatOptions`): how the value is written, for the Value and
  `aria-valuetext`. Without it, the value is written as a percentage of the range
  (`{ style: "percent" }` of `(value - min) / (max - min)`: `"60%"`, Base UI's default).
- `locale` (BCP 47): the locale of the format. Without it, the runtime's default (as
  [Slider](slider.md)'s); a page rendered on a server passes `locale`.
- `getAriaValueText(formattedValue, value)`: the Root's `aria-valuetext` instead of the formatted
  value.

**Meter.Label**: `id` (generated unless the consumer gives one). Its children are its text.

**Meter.Value**: its default content is the formatted value. Children: a function
`(formattedValue, value)` returning its content (React; Vue: the default scoped slot
`{ formattedValue, value }`; Angular: the directive's `formattedValue()` and `value()` signals
through `exportAs`).

**Meter.Track**, **Meter.Indicator**: no props.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="meter"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (the clamped value), `aria-valuetext` (the formatted value, or `getAriaValueText`'s), `aria-labelledby` (the Label's `id`, while a Label is rendered) |
| Label | `id` |
| Value | |
| Track | |
| Indicator | structural inline style: `inset-inline-start: 0`, `inline-size: <percent>%`, and the CSS variable `--meter-indicator-size: <percent>%` for a recipe that draws it otherwise (a ring) |

No state attribute: a meter has a value and nothing else (Base UI's Meter has none). The Root's
accessible name comes from its Label, or the consumer's `aria-label` / `aria-labelledby`.

## Keyboard

None: a meter is not focusable (APG).

## Focus

None.

## Pointer

None.

## Animation

None of its own.

## RTL

The Indicator grows from the inline start (`inset-inline-start`): right to left in RTL. Nothing
else changes.

## Scenarios

### `/meter/basic`

- A Meter whose `value` the fixture holds, starting at `60`, `locale="en-US"`: a Label
  **"Battery"**, a Value, a Track with its Indicator; buttons **"Drain"** (sets `10`) and
  **"Overcharge"** (sets `140`, which the Meter clamps to `100`).
- A Meter with a Label **"Storage"**, `max` `512`, `value` `384`, `format`
  `{ style: "unit", unit: "gigabyte" }`, `locale="en-US"`: a Value, a Track with its Indicator.

Output: `value: <the first Meter's value>` (the value the fixture holds).

Checks:

1. A `meter` named "Battery": `aria-valuenow="60"`, `aria-valuemin="0"`, `aria-valuemax="100"`,
   `aria-valuetext="60%"`; its Value reads `60%`; its Indicator is 60% of its Track's width.
2. A `meter` named "Storage": `aria-valuenow="384"`, `aria-valuemax="512"`,
   `aria-valuetext="384 GB"`; its Value reads `384 GB`; its Indicator is three quarters of its
   Track's width.
3. "Drain": `aria-valuenow="10"`, `aria-valuetext="10%"`.
4. "Overcharge": `value: 140`, and the meter is clamped: `aria-valuenow="100"`,
   `aria-valuetext="100%"`, the Indicator fills the Track.
5. Axe finds no violation.

### `/meter/basic?dir=rtl`

The same page in a right-to-left document: the Indicator starts at the Track's right edge.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Root renders a visually hidden `x` for NVDA | not rendered (no text, spec/README.md), as Progress; the screen reader check is open (`docs/handoff.md` §6) |
