# ColorSwatch

## Purpose

Show a color (Epic #101, Issue #100): a preview of a [color](color.md) value, its transparency over
a checkerboard the recipe draws. It is an image to assistive technologies (`role="img"`), named by
the app. It has no behaviour of its own: inside a [ColorPicker](color-picker.md) it shows the
picker's color unless it is given its own, and inside a [ColorSwatchPicker](color-swatch-picker.md)
Item it is the option's content. React Aria's ColorSwatch is the behaviour reference; neither the
APG nor Base UI has one (the APG `img` role decides its role and its name).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| ColorSwatch | `div` | `color-swatch-root` | the `img`; one part, no namespace (as AspectRatio) |

## API

- `color` (`Color | string`): the color it shows. Default: inside a ColorPicker, the picker's
  value; else transparent black (`#00000000`). A string `parseColor` cannot read shows transparent
  black too.
- Its name is the app's (`aria-label`, `aria-labelledby`). Without one, its `aria-label` is the
  color's CSS text (`formatColor(color, "css")`: `"rgb(51, 102, 153)"`, `"rgba(255, 0, 0, 0.5)"`).

**The name (the Issue's "a localized color name from the app or from the model's description",
adjusted).** The color model has no color names (spec/color.md, "Channels": `Intl` has none, and
React Aria's "dark vibrant blue" is English copy). An `img` must have a name (WCAG 1.1.1, axe's
`role-img-alt`), so without the app's the swatch names itself with the color's CSS text: data, not
words, the second recorded exception to spec/README.md "No text" after a calendar's `Intl` names
(the consumer replaces it with its `aria-label`). React Aria names the swatch with its localized
color name; a swatch with no name at all was discarded (axe fails it).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| ColorSwatch | `role="img"`, `aria-label` (the color's CSS text, unless the app names it: `aria-label` or `aria-labelledby` given), structural style `--color-swatch-color` (`formatColor(color, "css")`, with its alpha) and `--color-swatch-color-opaque` (the color at full alpha) |

The recipe draws the color over a checkerboard:
`background: linear-gradient(var(--color-swatch-color), var(--color-swatch-color)), <checkerboard>`
(the Issue's "transparency checkerboard via CSS variables only": the component sets the color, the
checkerboard is the recipe's, so no cosmetic inline style). The opaque color serves a recipe that
shows the color and its transparency side by side.

## Server rendering

The CSS variables and the name come from the value: in place before hydration.

## Scenarios

### `/color-swatch/basic`

Three swatches: `color` `"#336699"` with `aria-label` **"Ocean"**; `color` `"rgba(255, 0, 0,
0.5)"` with no name; `color` `"hsl(120, 100%, 25%)"` with `aria-label` **"Forest"**.

Checks:

1. Three `img`s named "Ocean", "rgba(255, 0, 0, 0.5)" (the color's CSS text) and "Forest"; each
   `data-primitives-part="color-swatch-root"`.
2. `--color-swatch-color`: `rgb(51, 102, 153)`, `rgba(255, 0, 0, 0.5)`, `hsl(120, 100%, 25%)`;
   `--color-swatch-color-opaque` of the second: `rgb(255, 0, 0)`.
3. Axe finds no violation.

## Differences from React Aria

- No color names: React Aria's default name is its localized color name (English copy here); the
  name is the app's, else the CSS text.
- No inline background: React Aria's swatch sets `background` with its checkerboard inline; here
  the color is a CSS variable and the checkerboard the recipe's (rule 7, structural style only).
