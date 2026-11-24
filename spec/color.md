# The color model

## Purpose

The value the color components share (Epic #99, Issue #98): an immutable color in the `rgb`,
`hsl` and `hsb` spaces with alpha, its parsing and formatting, the conversion between spaces, the
channels' ranges and their text through `Intl`, and the CSS gradients that draw a channel. It is
the toolkit's `@fragiola/primitives/color` entry (D8: only the color components import it, so it
stays out of every other bundle; the bundle guard checks it). It holds no component state: a
component keeps its own value and calls these functions.

[ColorSlider](color-slider.md), [ColorArea](color-area.md), [ColorWheel](color-wheel.md) and
[ColorField](color-field.md) are built on it, and so are the color pickers (Epic #101):
[ColorSwatch](color-swatch.md), [ColorSwatchPicker](color-swatch-picker.md) and
[ColorPicker](color-picker.md), which shares one value of this type with the controls inside it.

The behaviour references are React Aria's color package (`parseColor`, `Color`, the channel ranges
and the color components) and Zag/Ark's color picker, read and never copied. The APG has no color
pattern; the components follow the APG slider (and spinbutton) where they are one.

## The value

```ts
type ColorSpace = "rgb" | "hsl" | "hsb";
type ColorChannel = "red" | "green" | "blue" | "hue" | "saturation" | "lightness" | "brightness" | "alpha";

type Color =
    | { space: "rgb"; red: number; green: number; blue: number; alpha: number }
    | { space: "hsl"; hue: number; saturation: number; lightness: number; alpha: number }
    | { space: "hsb"; hue: number; saturation: number; brightness: number; alpha: number };
```

A plain, read-only object with its space as the discriminant, as a date is a plain
`{ year, month, day }` (AGENTS.md rule 9): no class, so it serialises, compares and crosses a
framework's reactivity (a Vue `ref`, an Angular signal) as data. Every function returns a new
object and never changes the one it got. `isSameColor(a, b)` compares two values (the same space
and channels). React Aria's `Color` is a class with methods; its methods are functions here
(`getColorChannel`, `setColorChannel`, `convertColor`, `formatColor`).

A component takes `Color | string` for its `value` and `defaultValue` (a string is parsed with
`parseColor`) and reports a `Color`. HSB is HSV (React Aria's name).

## Channels

| channel | spaces | range | step | large step | text (`Intl`) |
| --- | --- | --- | --- | --- | --- |
| `red`, `green`, `blue` | rgb | 0–255 | 1 | 17 | a whole number (`"128"`) |
| `hue` | hsl, hsb | 0–360 (degrees) | 1 | 15 | `unit: "degree"`, narrow (`"120°"`) |
| `saturation` | hsl, hsb | 0–100 | 1 | 10 | percent of `value / 100` (`"50%"`, de-DE `"50 %"`) |
| `lightness` | hsl | 0–100 | 1 | 10 | the same |
| `brightness` | hsb | 0–100 | 1 | 10 | the same |
| `alpha` | every space | 0–1 | 0.01 | 0.1 | percent (`"50%"`) |

React Aria's ranges and steps. The large step is Page Up / Page Down and Shift with an arrow.
`colorChannelRange(channel)` gives `{ min, max, step, largeStep }`, `colorChannels(space)` the three
color channels of a space, `hasColorChannel(space, channel)` whether it has one.

`getColorChannel(color, channel)` and `setColorChannel(color, channel, value)` (clamped to the
range) take a channel of the color's own space: another space's channel is a programming error
(`RangeError`); convert first. A control that edits a channel works in **the space it is given**
(`colorSpace`), else the value's own space when it has the channel, else the channel's own space
(red, green, blue: rgb; lightness: hsl; hue, saturation, brightness: hsb): `colorSpaceFor(channel,
color, colorSpace)`. It reports the color in that space, so the hue of a gray survives the next
change (a gray in rgb has no hue).

**Channel text.** `formatColorChannel(color, channel, locale, value?)` writes a channel's value with
`Intl.NumberFormat` (`colorChannelFormat(channel)` gives its options and the scale its value is
multiplied by first), rounded to whole units (the channels' step; alpha: whole percents). It is
locale data, not copy (the exception spec/README.md "No text" records for the calendars): a
thumb's `aria-valuetext` and an Output's default content. **The channel names are not provided**:
`Intl` has none, and an English "Hue" would be copy (spec/README.md, "No text"); the app names
every control (`aria-label`, a Label). React Aria's localized channel names are its strings.

## Parsing

`parseColor(text)` returns a `Color` or `null` (React Aria throws; a component's typed text is
expected to be wrong at times). It reads, trimmed and in any case:

- hex: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, the `#` optional (a ColorField's user may leave it
  out); an rgb color, its alpha the last byte over 255;
- `rgb()` / `rgba()`, `hsl()` / `hsla()`, `hsb()` / `hsba()`: three channels and an optional alpha,
  separated by commas, or by spaces with a `/` before the alpha; a hue may end in `deg`, the
  percentages in `%` (optional), an alpha may be a percent.

Out-of-range channels are clamped (CSS's rule), a hue is turned into `[0, 360)`, red, green and
blue rounded to whole numbers. CSS color names, `hwb()`, `lab()`, `oklch()` and `color()` are not
read (out of scope: the Epic's spaces are rgb, hsl and hsb; OKLCH is a recorded later option).
`parseColor` returns a `Color` given to it unchanged, so a component takes either.

## Formatting

`formatColor(color, format)`, lower-case hex and CSS functions with commas:

| format | gives |
| --- | --- |
| `hex` | `#rrggbb`, or `#rrggbbaa` when the alpha is below 1 (nothing is lost) |
| `hexa` | always `#rrggbbaa` |
| `rgb`, `rgba` | `rgb(51, 102, 153)`, `rgba(51, 102, 153, 0.5)` |
| `hsl`, `hsla` | `hsl(210, 50%, 40%)`, `hsla(210, 50%, 40%, 0.5)` |
| `hsb`, `hsba` | `hsb(210, 66.67%, 60%)` (no CSS function: for text and `parseColor` only) |
| `css` (default) | the color's own function, `rgb()` or `hsl()` (hsb as `hsl()`), with its alpha when below 1 |

A format of another space converts first. React Aria's `hex` drops the alpha; here it keeps it
when there is one, so a form's hex value never loses it. A form control's hidden input holds
`formatColor(color, "hex")`.

## Conversion

`convertColor(color, space)` returns the color in `space` (the same object when it already is):
hsl and hsb convert directly into each other, keeping the hue (through rgb a gray would lose it);
every other conversion goes through rgb. The alpha is kept. A gray converted from rgb has hue 0
and saturation 0.

## Precision

Each converted channel is rounded (the Epic's risk: rounding drifting on round trips):

| channel | precision |
| --- | --- |
| `red`, `green`, `blue` | whole numbers: 8-bit sRGB, what a hex string and a form hold |
| `hue`, `saturation`, `lightness`, `brightness` | 2 decimals |
| `alpha` | 4 decimals (parsed from hex: the byte over 255; every byte survives the round trip) |

What the unit tests hold (`packages/primitives/tests/color/`):

- every rgb color converted to hsl or hsb and back is the same rgb color (a 52 × 86 × 256 sample of
  the cube; whole-number rgb over 2-decimal hsl and hsb is exact);
- hsb → hsl → hsb is within 0.01 of every channel; hsl → hsb → hsl gives back whole-number
  channels (the controls' step) once rounded: its error, below 0.2, grows only near white and
  black, where hsl's saturation is amplified and barely shows;
- `parseColor(formatColor(color, f))` gives the color back for hex and the functions (alpha at
  every 1/255 step).

Values a control writes are snapped to the channel's step; the 2 decimals of a conversion only
show in a value that came from another space.

## Gradients

CSS strings a component sets as a CSS variable of its part (structural: the style the recipe
reads, AGENTS.md rule 7), every stop a linear ramp in sRGB so that the drawn color at a point is
the value there exactly:

- `colorChannelGradient(color, channel, direction)`: a slider's track, `linear-gradient(<direction>,
  …)` from the channel's `min` to its `max`, the color's other channels kept and opaque (the
  alpha track: from transparent to opaque); the hue track shows every hue at full saturation
  (stops every 60°, where the ramp turns); a lightness track turns at 50% (black, the color,
  white). `direction` is the slider's, `to right` (`to left` in RTL) or `to top`.
- `colorAreaBackground(color, xChannel, yChannel, rtl)`: an area's `backgroundImage` and
  `backgroundBlendMode`, two layers: two rgb channels add up through `screen` (`(x, 0, z)` over
  `(0, y, 0)`); a lightness axis is a black-below-50%-white-above layer over the other channel's
  ramp at 50% lightness; a brightness axis a black layer over the ramp at full brightness; a
  saturation axis beside a hue axis fades the full-saturation hue ramp to the gray of 0%. `x` runs
  from the inline start (the right in RTL), `y` from the bottom. Alpha is no area axis.
- `colorWheelGradient()`: `conic-gradient(…)` of every hue at full saturation, from 0° at the top,
  clockwise (the conic gradient's own start and direction).

## The keys and geometry

Pure functions the components share (spec/color-area.md, spec/color-wheel.md):
`colorAreaKeyTarget(key, shiftKey, { x, y, xRange, yRange, rtl })`, `colorWheelKeyTarget(key,
shiftKey, hue, step, largeStep)` and `wrapHue(hue, step)`, `hueAtPoint(box, point)`,
`isOnColorWheel(box, point, innerRadius, outerRadius)`, `colorWheelThumbOffset(hue, radius)`. A
slider's keys and pointer math are `/range`'s (`sliderKeyTarget`, `fractionAlong`,
`valueAtFraction`, `snapToStep`), its drags `/pointer`'s `startDrag`, its direction `/direction`'s.

## The eyedropper

`supportsEyeDropper(element)` tells whether the element's window has the EyeDropper API (Chromium
only); `openEyeDropper(element, signal?)` opens it and resolves with the picked color (an opaque
rgb color), or `null` when the pick was cancelled, refused or is not supported: it never rejects
(spec/color-picker.md, "EyeDropperTrigger").

## Scenarios

None of its own: the toolkit's unit tests hold the model, and each component's spec has its
scenarios.
