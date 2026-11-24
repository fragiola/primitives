---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

The color controls, natively in React, Vue and Angular, each in its own entry, on the toolkit's new color model. `/color` (toolkit): an immutable `Color` (a plain object in `rgb`, `hsl` or `hsb`, with alpha), `parseColor` (hex, `rgb()`, `hsl()`, `hsb()`; `null` for anything else), `formatColor` (`hex`, `hexa`, the functions, `css`), `convertColor` with a fixed precision per channel (rgb whole numbers, hue, saturation, lightness and brightness to 2 decimals, alpha to 4; round trips unit-tested), the channels' ranges and steps, their `Intl` text, the CSS gradients of a track, an area and a wheel, and an area's and a wheel's keys and geometry. `/color-slider` (`ColorSlider`: `Root`, `Label`, `Output`, `Track`, `Thumb`): the APG slider on one channel, its track a gradient, RTL, vertical, a Field control submitting the color as hex. `/color-area` (`ColorArea`: `Root`, `Thumb`, `Input`): two channels on a 2D area as two APG sliders (one native range input per axis), the focus following the axis a key moved, pointer drag. `/color-wheel` (`ColorWheel`: `Root`, `Track`, `Thumb`): the hue on a ring, wrapping, its inner and outer radius. `/color-field` (`ColorField`: `Root`, `Input`): a hex textbox, or the APG spinbutton for one channel, committed on Enter and blur, a Field control. Only the color components import `/color`; every existing entry is unchanged.
