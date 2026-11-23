# Slider

## Purpose

Choose a number (or a range of numbers) within bounds by dragging a thumb along a track, pressing
the track, or with the keyboard (APG `slider` and multi-thumb slider). It works in a native
`<form>`: each thumb submits its value. A slider with marks or labels along the track, a vertical
range in RTL writing modes and non-linear scales are out of scope.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `slider-root` | holds the state; a `group` |
| Label | `div` | `slider-label` | names the Root and its Thumbs (`aria-labelledby`) |
| Value | `output` | `slider-value` | shows the formatted value(s) |
| Control | `div` | `slider-control` | the interactive area: a press here moves the nearest thumb, then drags it |
| Track | `div` | `slider-track` | the rail |
| Indicator | `div` | `slider-indicator` | the filled part: from `min` to the value, or between two thumbs |
| Thumb | `div` | `slider-thumb` | a `slider`; one per value |
| (hidden input) | `input type="hidden"` | `slider-input` | one per value, rendered by the Root; what the form submits |

## API

**Root**:

- `value`, `defaultValue` (`min`), `onValueChange(value, details)`: a number, or an array of
  numbers for several thumbs (sorted ascending). The type of `defaultValue` (or `value`) decides
  between one and several thumbs.
- `onValueCommit(value, details)`: once, when a drag ends (pointer up) or after a key changes the
  value.
- `min` (`0`), `max` (`100`), `step` (`1`), `largeStep` (`10`, Page Up / Page Down and
  Shift+Arrow).
- `minStepsBetweenValues` (`0`): the smallest distance between two thumbs, in steps.
- `orientation` (`"horizontal"`), `disabled`, `name`.
- `format` (`Intl.NumberFormatOptions`): how the Value shows the values, and each Thumb's
  `aria-valuetext` (Base UI). Without it, the Value shows the plain numbers (`String(value)`) and
  the Thumbs have no `aria-valuetext` of their own.
- `locale` (BCP 47): the locale of `format`. Without it, the runtime's default
  (`Intl.NumberFormat(undefined, …)`: the browser's language). A page rendered on a server passes
  `locale`, so the server's formatting is the browser's.

**Label**: `id` (generated unless the consumer gives one). Its children are its text. It names the
Root (`aria-labelledby`) and every Thumb that has no `aria-label` or `aria-labelledby` of its own.
A press on it focuses the first Thumb (Base UI; a `div` has no native `for`). Inside a
[Field](field.md) the `Field.Label` names the slider instead: use one or the other.

**Value**: its default content is the formatted values (with `format`; else the numbers), joined
with `" – "` (an en dash between spaces, Base UI's separator: punctuation, not copy) for several
thumbs. Children: a function `(formattedValues, values)` returning its content (React; Vue: the
default scoped slot `{ formattedValues, values }`; Angular: the directive's `formattedValues()`
and `values()` signals through `exportAs`). `aria-live` (`"off"`, Base UI: it would announce every
step of a drag).

**Thumb**: `index` (its value's index; default: its order among the thumbs), `getAriaValueText(value,
index)` (a string for `aria-valuetext`; it wins over `format`), `disabled`. Its accessible name
comes from the consumer (`aria-label` or `aria-labelledby`), or the Label. A name the consumer
binds, or changes later, wins too (Epic #49; Angular: an `[attr.aria-label]` binding, not only a
static attribute): the Thumb is labelled by the Label only while it has no name of its own. Its
`id` is generated unless the consumer gives one (the Value's `for` lists them).

**Control**, **Track**, **Indicator**: no props.

Values snap to `min + n × step` and stay in `[min, max]`. With several thumbs, a thumb stays
`minStepsBetweenValues × step` away from its neighbours: thumbs never cross or swap.

Change reasons (spec/README.md): `keyboard` (a key on a thumb), `track-press` (a press on the
Control away from the thumb), `drag` (pointer moves after a press).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="group"`, `aria-labelledby` (the Label's `id`, while a Label is rendered), `data-orientation`, `data-disabled`, `data-dragging` while a pointer drags |
| Label | `id`, `data-orientation`, `data-disabled` |
| Value | `for` (the Thumbs' `id`s, in value order), `aria-live="off"`, `data-orientation`, `data-disabled` |
| Control, Track | `data-orientation`, `data-disabled`, `data-dragging` |
| Indicator | `data-orientation`; structural inline style: `inset-inline-start` and `inline-size` in % (horizontal), `inset-block-end` and `block-size` (vertical) |
| Thumb | `role="slider"`, `id`, `tabindex="0"` (none when disabled), `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (from `getAriaValueText`, else the formatted value with `format`), `aria-labelledby` (the Label's `id`, when it has no name of its own), `aria-orientation`, `aria-disabled="true"` and `data-disabled` when disabled, `data-orientation`, `data-index`, `data-dragging` while dragged; structural inline style placing it (`inset-inline-start: <percent>%` with a `translate`, or `inset-block-end` when vertical) |
| hidden input | `type="hidden"`, `name`, `value` (one per thumb, in order) |

With several thumbs, each thumb's `aria-valuemin` / `aria-valuemax` are the bounds it can reach
(the neighbour's value ∓ the minimum distance), as the APG multi-thumb example does.

## Keyboard

| key | horizontal | vertical |
| --- | --- | --- |
| increase by `step` | ArrowRight (ArrowLeft in RTL), ArrowUp | ArrowUp, ArrowRight (ArrowLeft in RTL) |
| decrease by `step` | ArrowLeft (ArrowRight in RTL), ArrowDown | ArrowDown, ArrowLeft (ArrowRight in RTL) |
| Page Up / Page Down, Shift+Arrow | ± `largeStep` | same |
| Home / End | `min` / `max` (within the thumb's reachable bounds) | same |

## Focus

Every thumb is a tab stop, in value order. A press on the Control focuses the thumb it moves.

## Pointer

- A press on the Control (mouse, touch, pen; primary button only) moves the **nearest** thumb to
  the value under the pointer (reason `track-press`) and starts a drag; with equidistant thumbs,
  the one the pointer is past moves (so the user can pull thumbs apart).
- The drag uses pointer capture: it follows the pointer outside the Control, the window included,
  until pointer up or cancel (reason `drag`; `data-dragging` meanwhile).
- The value maps linearly across the Control's box: its inline start is `min` (the right edge in
  RTL); vertically its bottom is `min`.
- `touch-action: none` on the Control (structural) keeps a touch drag from scrolling the page.

## RTL

Horizontal sliders run right to left: `min` at the right, the arrows swap. Vertical sliders do not
change. The direction is a [DirectionProvider](direction.md)'s, else the computed one.

## Server rendering

A Thumb's position is a percentage of its value (`inset-inline-start`, or `inset-block-end` when vertical),
written as inline style on the server too: it is in place before hydration with no script (Base
UI needs one for its `thumbAlignment="edge"`, which this library does not offer).

## Scenarios

The form scenarios print `form: <key=value&...>` as [checkbox.md](checkbox.md#scenarios) does.
The Control has `data-testid="control"` (it has no role) and is 200 px wide (or high, vertical),
so 1% of the range is 2 px, and pointer positions are chosen on whole pixels.

### `/slider/basic`

A `<form>`: a Slider with one thumb (`aria-label` **"Volume"**), `defaultValue` `50`, `name`
`"volume"`; a **"Submit"** button. Output: `value: ...` (the last change), `committed: ...` (the
last commit), `form: ...`.

Checks:

1. One `slider` named "Volume", value 50, min 0, max 100, horizontal.
2. Focused: ArrowRight → 51, ArrowUp → 52, ArrowLeft → 51, ArrowDown → 50, Page Up → 60,
   Page Down → 50, Shift+ArrowRight → 60, End → 100, Home → 0; `committed` follows each key.
3. A press on the Control at 30% → 30 (`committed: 30`); the thumb has focus.
4. Press the thumb and drag with stepped moves to 80% → 80 while dragging, `committed: 80` only
   after the release; dragging on below the Control (the pointer leaves it) to 90% → 90.
5. "Submit": `form: volume=<value>`.
6. Axe finds no violation.

### `/slider/range`

A `<form>`: thumbs **"Minimum price"** and **"Maximum price"**, `defaultValue` `[20, 80]`,
`minStepsBetweenValues` `10`, `name` `"price"`, `getAriaValueText` giving `"$20"`; a **"Submit"**
button. Output: `value: 20,80`, `form: ...`.

Checks:

1. Two sliders: "Minimum price" (value 20, `aria-valuetext="$20"`), "Maximum price" (80).
2. On "Minimum price", End → 70 (80 − 10); on "Maximum price", Home → 80 (70 + 10).
3. A press at 95% moves "Maximum price" (the nearest) → 95; at 5% moves "Minimum price" → 5.
4. "Submit": `form: price=<min>&price=<max>`.

### `/slider/vertical`

A vertical slider (`aria-label` **"Brightness"**), `defaultValue` `30`, 200 px high.

Checks: `aria-orientation="vertical"`; ArrowUp → 31, ArrowRight → 32, ArrowDown → 31; a press at
75% from the bottom → 75.

### `/slider/rtl?dir=rtl`

The slider of `/slider/basic` ("Volume", 50) in a document with `dir="rtl"`.

Checks: ArrowRight → 49, ArrowLeft → 50; a press at 25% from the **left** edge → 75.

### `/slider/label-value`

Two sliders:

- a Slider with a Label **"Volume"**, a Value, one Thumb with no name of its own; `min` `0`, `max`
  `1`, `step` `0.01`, `defaultValue` `0.5`, `format` `{ style: "percent" }`, `locale` `"en-US"`;
- a Slider with a Label **"Price"**, a Value, Thumbs **"Minimum price"** and **"Maximum price"**
  (`aria-label`); `defaultValue` `[20, 80]`, `format`
  `{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }`, `locale` `"de-DE"`.

Checks:

1. A `group` named "Volume" holding a `slider` named "Volume" (by the Label), `aria-valuenow`
   `0.5`, `aria-valuetext` `"50%"`; the Value reads "50%".
2. Focused, ArrowRight: `aria-valuenow` `0.51`, `aria-valuetext` `"51%"`, the Value "51%".
3. A press on the Label "Volume" focuses its thumb.
4. A `group` named "Price"; "Minimum price" has `aria-valuetext` `"20 €"`, "Maximum price"
   `"80 €"` (the de-DE format: a no-break space before the sign); the Value reads
   "20 € – 80 €".
5. The Value is an `output` whose `for` lists both thumbs' `id`s, in order; `aria-live="off"`.
6. Axe finds no violation.

### `/slider/thumb-name`

A Slider with a Label **"Volume"**, `defaultValue` `50`, and one Thumb whose `aria-label` the
fixture binds from its state (Angular: `[attr.aria-label]`), starting at **"Master volume"**; then
a button **"Rename"** that sets it to **"Main volume"** (Epic #49).

Checks:

1. A `group` named "Volume" holding a `slider` named "Master volume" (the consumer's name wins
   over the Label's), with no `aria-labelledby`.
2. "Rename": the slider is named "Main volume", still with no `aria-labelledby`.

### `/slider/controlled`

A slider (`aria-label` **"Limited"**) whose value the fixture holds, starting at `70`, refusing
any value above `80` (spec/README.md, "A controlled value the consumer rejects"). Output: `value:
...`, `requested: ...`.

Checks: End reports `requested: 100` and the slider stays at 70; ArrowRight → 71.

## Differences from Base UI

- **`aria-valuetext` of a range with `format`**: the formatted value alone. Base UI appends
  `" start range"` / `" end range"`, English copy, which this library never renders (spec/README.md,
  "No text"); the Thumbs' own names say which end they are.
- **The default `locale`** is the runtime's (as Base UI); the calendars' document-`lang` rule is
  not applied to a number format.

Measured by the POC against Base UI 1.9 (`Slider`): no behaviour difference. Base UI's thumbs hold
a native `<input type="range">`, which gives the `slider` role, the value and the bounds natively;
these thumbs are `div`s with `role="slider"` and the ARIA values, as the APG slider pattern does,
and the form value comes from hidden inputs.
