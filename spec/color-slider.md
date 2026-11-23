# ColorSlider

## Purpose

Choose one channel of a color (its hue, saturation, lightness, brightness, red, green, blue or
alpha) along a track that shows the channel's colors (Epic #99, Issue #98). It is the **APG slider**:
one `slider` thumb, its arrows, Page keys, Home and End; its value is a [color](color.md), the
channel its `aria-valuenow`. It works in a native `<form>` and a [Field](field.md). The model is the
toolkit's `/color`; the range math, keys and drag are [Slider](slider.md)'s mechanisms
(`/range`, `/pointer`), through each framework's own code (ColorSlider never imports Slider's
entry). React Aria's ColorSlider is the behaviour reference.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-slider-root` | holds the value; a `group`, named by the Label |
| Label | `div` | `color-slider-label` | names the Root and the Thumb (`aria-labelledby`) |
| Output | `output` | `color-slider-output` | shows the channel's value as text |
| Track | `div` | `color-slider-track` | the interactive area and the channel's gradient: a press moves the thumb there, then drags it |
| Thumb | `div` | `color-slider-thumb` | the `slider` |
| (hidden input) | `input type="hidden"` | `color-slider-input` | rendered by the Root: the color as hex, what the form submits |

The Track is both Slider's Control and Track (React Aria's): a gradient is drawn on the area the
pointer presses.

## API

**Root**:

- `value`, `defaultValue` (`Color | string`; default `"#000000"`), `onValueChange(color,
  details)`: the color, in the slider's space (below).
- `onValueCommit(color, details)`: once, when a drag ends or after a key changes the value
  (Slider's rule).
- `channel` (required): the channel the slider edits.
- `colorSpace`: the space it edits the channel in; default: the value's own space when it has the
  channel, else the channel's own (spec/color.md, "Channels"). A change reports the color in it.
- `orientation` (`"horizontal"`), `disabled`, `name`, `locale` (the channel text's; default: the
  runtime's, as Slider's `locale`).

The range, the step and the large step are the channel's (spec/color.md); the value snaps to the
step and stays in the range.

**Label**: `id` (generated unless given); names the Root and the Thumb while the Thumb has no name
of its own; a press on it focuses the Thumb (Slider's Label). Inside a Field, `Field.Label` names
it instead.

**Output**: its default content is the channel's text (`"120°"`, `"50%"`, `"128"`); content of its
own replaces it. `for` the Thumb's `id`, `aria-live="off"` (Slider's Value).

**Thumb**: `id` (generated unless given); its name is the consumer's (`aria-label`,
`aria-labelledby`) or the Label's. No text of its own: no channel name (spec/color.md).

**Track**: no props.

Change reasons (spec/README.md): `keyboard`, `track-press`, `drag` (Slider's).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="group"`, `aria-labelledby` (the Label's id, while one renders), `data-orientation`, `data-channel`, `data-disabled`, `data-dragging` |
| Label, Output | `data-orientation`, `data-channel`, `data-disabled`; the Output `for`, `aria-live="off"` |
| Track | `data-orientation`, `data-channel`, `data-disabled`, `data-dragging`; structural style `position: relative`, `touch-action: none`, `--color-slider-track-background` (spec/color.md `colorChannelGradient`, from `min` to `max`: `to right`, `to left` in RTL, `to top` when vertical) |
| Thumb | `role="slider"`, `id`, `tabindex="0"` (none when disabled), `aria-valuenow` (the channel), `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (the channel's text), `aria-orientation`, `aria-labelledby` (the Label, when it has no name of its own), `aria-disabled="true"` when disabled, `data-orientation`, `data-channel`, `data-disabled`, `data-dragging`; structural style placing it (Slider's Thumb: `inset-inline-start: <percent>%` with a `translate`, or `inset-block-end` when vertical) and `--color-slider-thumb-color` (the color, `formatColor(color, "css")`) |
| hidden input | `type="hidden"`, `name`, `value` (`formatColor(color, "hex")`) |

The two CSS variables are what a recipe draws with (`background: var(--color-slider-track-background)`);
an alpha track shows a checkerboard under it (the recipe's).

## Keyboard

Slider's ([slider.md](slider.md#keyboard)), with the channel's step and large step: the arrows by
one step (the horizontal arrows swapped in RTL), Page Up / Page Down and Shift with an arrow by the
large step, Home and End to `min` and `max`. A hue slider does not wrap (the APG slider stops at its
ends; a [ColorWheel](color-wheel.md) wraps).

## Pointer

Slider's on the Track: a press (primary button) moves the thumb to the value under the pointer
(`track-press`), focuses it and drags it with pointer capture (`drag`, `data-dragging`) until
release; the value maps linearly across the Track's box from its inline start (the right in RTL),
from its bottom when vertical.

## RTL

A horizontal slider runs right to left: `min` at the right, the arrows swapped, the gradient `to
left`. Vertical sliders do not change. The direction is a DirectionProvider's, else the computed
one.

## Forms and Field

The hidden input (spec/README.md, "Forms") submits the color as hex (`#rrggbb`, `#rrggbbaa` below
full alpha: the Issue's "the color string"), whatever the channel: a hue slider submits the color
it shows. A form reset returns an uncontrolled slider to its `defaultValue` (reason `none`).
Inside a [Field](field.md) it is a Field control as a Slider is (the Field's `name`, label,
description, disabled; `ENTRY_DEPENDENCIES` `["field"]`).

## Server rendering

The Thumb's position, the gradient and the thumb color are inline style from the value: in place
before hydration.

## Scenarios

The form scenarios print `form: <key=value&...>`; the Track has `data-testid="track"` and is
200 px wide (high, vertical).

### `/color-slider/basic`

A `<form>`: a ColorSlider with `channel` `"hue"`, `defaultValue` `"hsl(0, 100%, 50%)"`, `name`
`"color"`, `locale` `"en-US"`, a Label **"Hue"**, an Output, the Track and its Thumb; a **"Submit"**
button. Output: `value: ...` (the last change, `formatColor(color, "css")`), `committed: ...`,
`form: ...`.

Checks:

1. A `group` named "Hue" holding one `slider` named "Hue" (by the Label): value 0, min 0, max 360,
   `aria-valuetext` `"0°"`; the Output reads "0°".
2. Focused: ArrowRight → 1 (`value: hsl(1, 100%, 50%)`, `committed` too), ArrowUp → 2, ArrowLeft →
   1, ArrowDown → 0, Page Up → 15, Page Down → 0, Shift+ArrowRight → 15, End → 360, Home → 0.
3. A press on the Track at 50% → 180, focused, `committed: hsl(180, 100%, 50%)`.
4. A drag from the thumb to 75% → 270 while dragging (`committed` unchanged), committed on release.
5. "Submit" after a press at 50%: `form: color=#00ffff`.
6. The Track's `--color-slider-track-background` is the hue gradient `to right`; axe finds no
   violation.

### `/color-slider/alpha`

A ColorSlider with `channel` `"alpha"`, `defaultValue` `"rgba(51, 102, 153, 0.5)"`, `locale` `"de-DE"`, `aria-label` **"Opacity"** on its Thumb, an
Output.

Checks: value 0.5, min 0, max 1, `aria-valuetext` `"50 %"` (de-DE), the Output too; ArrowRight →
0.51 (`"51 %"`), Page Up → 0.61, End → 1 (`"100 %"`); the Thumb's `--color-slider-thumb-color` is
`rgb(51, 102, 153)` at 1 and the track runs from `rgba(51, 102, 153, 0)` to `rgb(51, 102, 153)`.

### `/color-slider/vertical`

A vertical ColorSlider, `channel` `"brightness"`, `defaultValue` `"hsb(210, 50%, 30%)"`, Thumb
`aria-label` **"Brightness"**, 200 px high.

Checks: `aria-orientation="vertical"`; ArrowUp → 31, ArrowRight → 32, ArrowDown → 31; a press at
75% from the bottom → 75; the gradient runs `to top`.

### `/color-slider/rtl?dir=rtl`

The slider of `/color-slider/basic` in a document with `dir="rtl"`.

Checks: ArrowLeft → 1, ArrowRight → 0; a press at 25% from the **left** edge → 270; the gradient
runs `to left`.

### `/color-slider/space`

Three ColorSliders on one value the fixture holds, starting at `"#336699"`: `channel` `"red"`
(Thumb **"Red"**), `"hue"` with `colorSpace` `"hsl"` (**"Hue"**) and `"lightness"` (**"Lightness"**),
each with the shared value and `onValueChange` setting it. Output: `value: ...`.

Checks:

1. "Red" is 51; "Hue" 210 and "Lightness" 40 (the value converted to hsl).
2. On "Lightness", ArrowUp → 41: `value: hsl(210, 50%, 41%)` (the color reported in hsl); "Red" is
   now 52 (that color in rgb is `rgb(52, 105, 157)`) and "Hue" still 210.
3. On "Red", Home → 0: `value: rgb(0, 105, 157)` (reported in rgb).

## Differences from React Aria

- `aria-valuetext` is the channel's text alone: React Aria appends the color's name ("dark vibrant
  blue"), English copy this library never renders (spec/README.md, "No text").
- The hidden input submits the color as hex (React Aria's submits the channel's number): the
  Issue's choice, so a form receives a color whatever the channel.
- No Label default text: React Aria's Label falls back to the channel's localized name.
