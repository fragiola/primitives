# ColorWheel

## Purpose

Choose a color's hue on a ring (Epic #99, Issue #98): a thumb moves around a circular track that
shows every hue. It is an **APG slider** whose track is a circle: one `slider` thumb with the hue
as its value, the arrows and Page keys stepping it; the hue **wraps** (from 359° on to 0°), which a
circle has and a line does not. React Aria's ColorWheel is the behaviour reference. It works in a
native `<form>`.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-wheel-root` | holds the value; the interactive area, `2 × outerRadius` square |
| Track | `div` | `color-wheel-track` | the ring and its conic gradient |
| Thumb | `div` | `color-wheel-thumb` | the `slider` |
| (hidden input) | `input type="hidden"` | `color-wheel-input` | rendered by the Root: the color as hex |

## API

**Root**:

- `value`, `defaultValue` (`Color | string`; default `"hsl(0, 100%, 50%)"`), `onValueChange(color,
  details)`, `onValueCommit(color, details)` (when a drag ends, after a key).
- `colorSpace` (`"hsl"` or `"hsb"`): the space of the hue; default: the value's own when it has a
  hue, else hsb (spec/color.md, "Channels").
- `outerRadius` (`100`) and `innerRadius` (`75`), in px: the ring. A press between them starts a
  drag; the thumb sits on the circle between them.
- `disabled`, `name`, `locale` (the hue's text).

**Track**, **Thumb**: no props; the Thumb's name is the consumer's (`aria-label`,
`aria-labelledby`).

Change reasons: `keyboard`, `track-press` (a press on the ring), `drag`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-dragging`; structural style `position: relative`, `inline-size` and `block-size` `2 × outerRadius` px, `touch-action: none`, `--color-wheel-outer-radius` and `--color-wheel-inner-radius` (px, for the recipe's ring mask) |
| Track | `data-disabled`, `data-dragging`; structural style `position: absolute`, `inset: 0`, `--color-wheel-track-background` (`colorWheelGradient()`: 0° at the top, clockwise) |
| Thumb | `role="slider"`, `tabindex="0"` (none when disabled), `aria-valuenow` (the hue), `aria-valuemin="0"`, `aria-valuemax="360"`, `aria-valuetext` (the hue's text, `"90°"`), `aria-disabled="true"` when disabled, `data-disabled`, `data-dragging`; structural style `position: absolute`, `left: calc(50% + <x>px)`, `top: calc(50% + <y>px)` (`colorWheelThumbOffset(hue, (innerRadius + outerRadius) / 2)`), `translate: -50% -50%`, `--color-wheel-thumb-color` (the color, opaque) |
| hidden input | `type="hidden"`, `name`, `value` (`formatColor(color, "hex")`) |

The ring is drawn by the recipe from the variables (a round Track masked inside `innerRadius`):
physical and the same in RTL, as a color wheel has no reading direction.

## Keyboard

| key | hue |
| --- | --- |
| ArrowRight, ArrowUp | + 1° (Shift: + 15°) |
| ArrowLeft, ArrowDown | − 1° (Shift: − 15°) |
| Page Up / Page Down | ± 15° |
| Home / End | 0° / 359° (the last step before 360°, which is 0°) |

The hue wraps around (`colorWheelKeyTarget`): ArrowLeft at 0° gives 359°, ArrowRight at 359° gives
0°. The arrows do not swap in RTL (the wheel turns the same way in both directions; React Aria's).

## Pointer

A press on the ring (between `innerRadius` and `outerRadius` from the Root's centre; primary button)
moves the thumb to the hue at that angle (`hueAtPoint`, `track-press`), focuses it and drags it with
pointer capture (`drag`, `data-dragging`) until release: the drag follows the pointer's angle
anywhere, the window included. A press off the ring (its centre, the corners) does nothing.

## Forms

The hidden input submits the color as hex; a form reset returns an uncontrolled wheel to its
`defaultValue` (reason `none`). The wheel is no Field control (its single value is a slider's, as a
ColorArea's; a Field wraps a ColorField or a ColorSlider).

## Server rendering

The Thumb's position and the gradient are rendered from the value: in place before hydration.

## Scenarios

The Root has `data-testid="wheel"`, `outerRadius` `100`, `innerRadius` `76` (200 × 200 px, the
thumb on the circle of 88 px).

### `/color-wheel/basic`

A `<form>`: a ColorWheel with `defaultValue` `"hsl(90, 100%, 50%)"`, `name` `"color"`, `locale`
`"en-US"`, its Track and its Thumb (`aria-label` **"Hue"**); a **"Submit"** button. Output: `value:
...` (`formatColor(color, "css")`), `committed: ...`, `form: ...`.

Checks:

1. One `slider` named "Hue": value 90, min 0, max 360, `aria-valuetext` `"90°"`; its centre is 88 px
   right of the wheel's centre.
2. Focused: ArrowRight → 91 (`value: hsl(91, 100%, 50%)`, `committed` too), ArrowUp → 92, ArrowLeft
   → 91, ArrowDown → 90, Page Up → 105, Page Down → 90, Shift+ArrowLeft → 75, Home → 0, ArrowLeft →
   359, End → 359, ArrowRight → 0.
3. A press on the ring at its bottom (12 px above the Root's bottom edge, centred) → 180, the thumb
   focused, `committed: hsl(180, 100%, 50%)`.
4. A press at the Root's centre changes nothing.
5. A drag from the thumb to the ring's left (12 px from the Root's left edge, centred) → 270 while
   dragging (`committed` unchanged), committed on release.
6. "Submit" after the press of 3: `form: color=#00ffff`.
7. Axe finds no violation.

### `/color-wheel/disabled`

A disabled ColorWheel, `defaultValue` `"hsb(200, 100%, 100%)"`, Thumb **"Hue"**.

Checks: `aria-disabled="true"`, no `tabindex`, `data-disabled` on every part; a press on the ring
and the arrows change nothing.

## Differences from React Aria

- 0° is at the top and the hue grows clockwise (the CSS conic gradient's own geometry, so the track
  needs no rotation); React Aria starts at the right.
- The Thumb is a `div` with `role="slider"` (Slider's thumb) and the form value a hidden input with
  the color as hex; React Aria's thumb holds a native range input submitting the hue.
- Home and End (0° and 359°), from the APG slider; React Aria has none.
- `innerRadius` and `outerRadius` default to 75 and 100 px (React Aria requires them).
