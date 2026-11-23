# ColorArea

## Purpose

Choose two channels of a color at once (saturation and brightness, by default) by dragging a
thumb over a two-dimensional area, or with the keyboard (Epic #99, Issue #98). **The APG has no
two-dimensional slider and Base UI no color area**, so its accessible model is decided here (the
Epic's risk, D4's stop condition: the APG-closest option, recorded in `docs/decisions.md`): **two
APG sliders, one per axis**, each a native `<input type="range">` visually hidden in the thumb
(React Aria's ColorArea, the Issue's recommended option). A screen reader meets two named sliders
with their values; the keyboard moves both axes from either one; axe is the referee (each input is
a labelled `slider`, the area a named `group`).

Alternatives discarded: one `slider` whose `aria-valuetext` speaks both channels (one value, the
APG slider holds one number; the second axis would have no value of its own); `role="application"`
(it hides everything from browse mode); a grid of cells (nothing a user picks from).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-area-root` | holds the value; a `group` the consumer names; the interactive area and its background |
| Thumb | `div` | `color-area-thumb` | marks the point; holds the Inputs |
| Input | `input type="range"` | `color-area-input` | one per axis (`axis="x"`, `axis="y"`): the two sliders, visually hidden |

## API

**Root**:

- `value`, `defaultValue` (`Color | string`; default `"hsb(0, 100%, 100%)"`), `onValueChange(color,
  details)`, `onValueCommit(color, details)` (when a drag ends, after a key; Slider's rule).
- `xChannel`, `yChannel`: the channels of the two axes, two different color channels of one space
  (no alpha). `colorSpace`: the space (spec/color.md). Defaults: the space is `colorSpace`, else the
  value's own when it has both given channels, else the space of the more specific channel
  (lightness: hsl; brightness: hsb; red, green, blue: rgb; else hsb); the channels default to the
  space's (rgb: red and green; hsl: saturation and lightness; hsb: saturation and brightness).
  `colorAreaChannels` (toolkit) resolves them. A change reports the color in that space.
- `disabled`, `locale` (the channels' text).

**Input**: `axis` (`"x"` or `"y"`, required), `name` (its channel's value is what the form
submits: a native range input), its name from the consumer (`aria-label`, `aria-labelledby`): no
channel name of its own (spec/color.md).

**Thumb**: no props.

Change reasons: `keyboard` (a key, or an assistive technology's change of an Input), `track-press`
(a press on the Root), `drag`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="group"`, `data-disabled`, `data-dragging`; structural style `position: relative`, `touch-action: none`, `--color-area-background` and `--color-area-background-blend-mode` (spec/color.md `colorAreaBackground`, x from the inline start) |
| Thumb | `data-disabled`, `data-dragging`; structural style `position: absolute`, `inset-inline-start: <x percent>%`, `inset-block-end: <y percent>%`, a centring `translate` (`-50% 50%`; `50% 50%` in an RTL layout), `--color-area-thumb-color` (the color, opaque, `formatColor`'s `css`) |
| Input | `type="range"`, `min`, `max`, `step` (its channel's), `value`, `aria-valuetext` (the channel's text), `aria-orientation` (`horizontal` for x, `vertical` for y), `tabindex` (`0` for the axis that is the tab stop, `-1` for the other), `disabled` when disabled, `data-axis`, `data-channel`, `name`; structural style: visually hidden (the toolkit's `VISUALLY_HIDDEN_INPUT_STYLE`, its `pointer-events: none`) |

The focus ring is drawn on the Thumb while one of its Inputs has the keyboard focus (the recipe's
`:has(:focus-visible)`).

## Keyboard

The area has **one tab stop**: the Input of the axis last moved by a key (x at first). Either
Input handles every key (`colorAreaKeyTarget`), so the arrows move both axes from wherever the
focus is:

| key | moves |
| --- | --- |
| ArrowRight / ArrowLeft | `x` by one step (swapped in RTL); Shift: the large step |
| ArrowUp / ArrowDown | `y` by one step; Shift: the large step |
| Page Up / Page Down | `y` by the large step |
| Home / End | `x` to its `min` / `max` |

**The focus follows the axis a key moved**: a key that moves `y` focuses the y Input (which becomes
the tab stop), one that moves `x` the x Input, so a screen reader announces the slider whose value
changed. The native range keys never run (each key is handled and its default prevented); an
assistive technology's own change of an Input (its `input` event) sets that axis.

## Pointer

A press on the Root (primary button) moves the thumb to the point (both axes, `track-press`),
focuses the tab-stop Input and drags it with pointer capture (`/pointer`'s `startDrag`, `drag`,
`data-dragging`) until release, clamped to the area. `x` maps from the Root's inline start (its
right in RTL), `y` from its bottom.

## RTL

`x` runs from the right: its `min` at the right, ArrowRight decreases it, the background's x ramp
`to left`. `y` does not change.

## Forms

Each Input is a native range input: its `name` submits its channel's value (`saturation=50`), and
a form reset returns an uncontrolled area to its `defaultValue` (reason `none`). The area is no
Field control (React Aria's ColorArea is none either): its two values have two names.

## Server rendering

The Thumb's position, the background and the Inputs' values are rendered from the value: in place
before hydration.

## Scenarios

The Root has `data-testid="area"`, 200 × 200 px, so 1% of a 0–100 channel is 2 px.

### `/color-area/basic`

A `<form>`: a ColorArea (`aria-label` **"Color"**) with `defaultValue` `"hsb(210, 50%, 50%)"`,
`xChannel` `"saturation"`, `yChannel` `"brightness"`, `locale` `"en-US"`; its Thumb holds an Input
`axis="x"` **"Saturation"** (`name` `"saturation"`) and an Input `axis="y"` **"Brightness"**
(`name` `"brightness"`); a **"Submit"** button. Output: `value: ...` (`formatColor(color, "hsb")`),
`committed: ...`, `form: ...`.

Checks:

1. A `group` named "Color"; two sliders: "Saturation" 50 (0–100, `aria-valuetext` `"50%"`) and
   "Brightness" 50. Only "Saturation" is a tab stop.
2. "Saturation" focused: ArrowRight → saturation 51 (`value: hsb(210, 51%, 50%)`, `committed`
   too); ArrowUp → brightness 51, and "Brightness" has the focus (and is the tab stop); ArrowLeft
   → saturation 50, "Saturation" focused; Page Up → brightness 61; Page Down → 51; Shift+ArrowRight
   → saturation 60; Shift+ArrowDown → brightness 41; Home → saturation 0; End → 100.
3. A press at 25% from the left and 25% from the top → saturation 25, brightness 75
   (`committed: hsb(210, 25%, 75%)`); "Saturation" has the focus.
4. A drag from the thumb to 80% from the left and 10% from the top → 80 and 90 while dragging
   (`committed` unchanged); on past the area's top-right corner → 100 and 100; committed on release.
5. "Submit" after the press of 3: `form: saturation=25&brightness=75`.
6. Axe finds no violation.

### `/color-area/rtl?dir=rtl`

The area of `/color-area/basic` in a document with `dir="rtl"`.

Checks: ArrowRight → saturation 49, ArrowLeft → 50; a press at 25% from the **left** and 25% from
the top → saturation 75, brightness 75.

### `/color-area/rgb`

A ColorArea (`aria-label` **"Red and green"**) with `defaultValue` `"rgb(0, 0, 128)"`, `xChannel`
`"red"`, `yChannel` `"green"`; Inputs **"Red"** and **"Green"**.

Checks: "Red" 0 (0–255, `aria-valuetext` `"0"`), "Green" 0; on "Red", End → 255, Page Up → green
17; the Root's `--color-area-background-blend-mode` is `screen`.

## Differences from React Aria

- No `aria-roledescription` ("2D slider") and no channel names in `aria-valuetext`: copy this
  library never renders; the app names each Input.
- The focus follows the axis a key moved (React Aria keeps it and toggles `aria-hidden` on the
  other input): every slider stays in the accessibility tree.
- Home and End set `x` to its ends (APG slider); React Aria moves it by its page step.
