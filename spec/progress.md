# Progress

## Purpose

Shows how far a task has gone (the ARIA `progressbar` role; the APG has no pattern of its own,
its "Range related properties" practice applies): a value between `min` and `max`, or an unknown
amount of progress (indeterminate). It is not interactive. A gauge of a known quantity (a disk's
usage, a score) is a Meter (stage 2), not a Progress.

**Scope: stage 1** (Epic #29). Base UI's `Progress` (1.9) decides the parts, the states and the
default format (D4); the no-text rule decides the indeterminate state's `aria-valuetext` (none).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Progress.Root | `div` | `progress-root` | the `progressbar`; holds the value |
| Progress.Label | `span` | `progress-label` | names the Root (`aria-labelledby`) |
| Progress.Value | `span` | `progress-value` | shows the formatted value |
| Progress.Track | `div` | `progress-track` | the rail |
| Progress.Indicator | `div` | `progress-indicator` | the filled part, inside the Track |

## API

**Progress.Root**:

- `value` (required): a number, or `null` for an indeterminate progress. It is clamped to
  `[min, max]`.
- `min` (`0`), `max` (`100`).
- `format` (`Intl.NumberFormatOptions`): how the value is written, for the Value and
  `aria-valuetext`. Without it, the value is written as a percentage of the range
  (`{ style: "percent" }` of `(value - min) / (max - min)`: `"40%"`, Base UI's default).
- `locale` (BCP 47): the locale of the format. Without it, the runtime's default (as
  [Slider](slider.md)'s); a page rendered on a server passes `locale`.
- `getAriaValueText(formattedValue, value)`: the Root's `aria-valuetext` instead of the formatted
  value; it receives `null` and `""` when indeterminate.

**Progress.Label**: `id` (generated unless the consumer gives one). Its children are its text.

**Progress.Value**: its default content is the formatted value (empty when indeterminate).
Children: a function `(formattedValue, value)` returning its content (React; Vue: the default
scoped slot `{ formattedValue, value }`; Angular: the directive's `formattedValue()` and `value()`
signals through `exportAs`).

**Progress.Track**, **Progress.Indicator**: no props.

The status is `indeterminate` (`value` is `null`), `complete` (the clamped value is `max`), else
`progressing`.

## State attributes and ARIA

Every part carries the status: exactly one of `data-indeterminate`, `data-progressing`,
`data-complete`.

| part | attributes |
| --- | --- |
| Root | `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (the clamped value; absent when indeterminate), `aria-valuetext` (the formatted value, or `getAriaValueText`'s; absent when indeterminate without `getAriaValueText`), `aria-labelledby` (the Label's `id`, while a Label is rendered) |
| Label | `id` |
| Value | |
| Track | |
| Indicator | structural inline style while not indeterminate: `inset-inline-start: 0`, `inline-size: <percent>%`, and the CSS variable `--progress-indicator-size: <percent>%` for a recipe that draws it otherwise (a ring); none when indeterminate |

The Root's accessible name comes from its Label, or the consumer's `aria-label` /
`aria-labelledby`.

## Keyboard

None: a progress bar is not focusable.

## Focus

None.

## Pointer

None.

## Animation

None of its own. An indeterminate Indicator's animation is the recipe's, from
`data-indeterminate`.

## RTL

The Indicator grows from the inline start (`inset-inline-start`): right to left in RTL. Nothing
else changes.

## Scenarios

### `/progress/basic`

- A Progress whose `value` the fixture holds, starting at `40`, `locale="en-US"`: a Label
  **"Upload"**, a Value, a Track with its Indicator; buttons **"Complete"** (sets `100`) and
  **"Unknown"** (sets `null`).
- A Progress with a Label **"Storage"**, `min` `0`, `max` `512`, `value` `128`, `format`
  `{ style: "unit", unit: "gigabyte" }`, `locale="en-US"`: a Value, a Track with its Indicator.

Output: `value: <the first Progress's value>` (`none` for `null`).

Checks:

1. A `progressbar` named "Upload": `aria-valuenow="40"`, `aria-valuemin="0"`,
   `aria-valuemax="100"`, `aria-valuetext="40%"`; its Value reads `40%`.
2. A `progressbar` named "Storage": `aria-valuenow="128"`, `aria-valuemax="512"`,
   `aria-valuetext="128 GB"`; its Value reads `128 GB`; its Indicator is a quarter of its Track's
   width.
3. "Complete": `aria-valuenow="100"`, `aria-valuetext="100%"`, the Indicator fills the Track.
4. "Unknown": no `aria-valuenow` and no `aria-valuetext`; the Value is empty.
5. Axe finds no violation, in each state.

## Differences from Base UI

| difference | decision |
| --- | --- |
| An indeterminate Base UI progress has `aria-valuetext="indeterminate progress"` | no `aria-valuetext` (no text, spec/README.md); `getAriaValueText` gives one |
| Base UI's Root renders a visually hidden `x` for NVDA | not rendered (no text); the screen reader check is open (`docs/handoff.md` §6) |
