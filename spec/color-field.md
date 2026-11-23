# ColorField

## Purpose

Type a color (Epic #99, Issue #98): a text input that reads a color as hex (or any text
`parseColor` reads) and writes it back as hex, or, given a `channel`, one channel of a color as a
number. The typed text is free until it is **committed**, on Enter or on blur: then it is parsed,
and either becomes the value or goes back to the value's text. The arrows step it. It works in a
native `<form>` and a [Field](field.md). React Aria's ColorField is the behaviour reference; the
channel mode is the **APG spinbutton** (a NumberField's role, spec/number-field.md), formatted and
parsed with the toolkit's `/number` and the channel's `Intl` text (spec/color.md); the hex mode is a
textbox (a hex string is no number a spinbutton could announce).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-field-root` | holds the value and the text; renders the hidden input after its children |
| Input | `input` | `color-field-input` | the text: a textbox, or a `spinbutton` with `channel` |
| (hidden input) | `input` | `color-field-hidden-input` | what the form submits and validates (NumberField's) |

## API

**Root**:

- `value`, `defaultValue` (`Color | string | null`; default `null`: empty), `onValueChange(color |
  null, details)`: called when a commit or a step changes the value, never while typing.
- `channel`: the channel the field edits (the channel mode); none: the whole color, as hex.
- `colorSpace`: with `channel`, the space it edits it in (spec/color.md, "Channels"); a change
  reports the color in it.
- `locale` (the channel's text), `name` (the hidden input's; a Field's wins), `id` (the Input's,
  generated unless given), `disabled`, `readOnly`, `required`.

**Input**: no props of its own; its name is the consumer's (`aria-label`, a `<label for>` with the
Root's `id`, or `Field.Label`).

Change reasons (spec/README.md): `keyboard` (Enter committed the text; an arrow, Page or Home/End
key stepped it), `input-blur` (the blur committed it), `input-clear` (an empty text committed:
`null`, hex mode).

### The hex mode (no `channel`)

- The text is `formatColor(value, "hex")` (`#336699`; `#33669980` below full alpha), `""` for
  `null`.
- A commit parses the typed text (`parseColor`: hex with or without `#`, `rgb()`, `hsl()`, …): a
  color becomes the value, as parsed (its own space), and the text its hex; an empty text gives
  `null`; anything else changes nothing and the text goes back to the value's hex.
- ArrowUp / ArrowDown add or subtract 1 to the color as a 24-bit number (`#0000ff` → `#000100`,
  React Aria's), from the typed text when it parses, else from the value (`#000000` for `null`),
  clamped to `#000000`–`#ffffff`, the alpha kept; the result is an rgb color. Other keys keep their
  text meaning (Home, End and the Page keys move the caret).

### The channel mode (`channel`)

- The text is the channel's text (`formatColorChannel`: `"120°"`, `"50%"`, `"128"`), `""` for
  `null`.
- A commit parses the typed text with `/number`'s `parseNumber` for the locale and the channel's
  format (spec/color.md: `"200"`, `"200°"`, `"50%"` and `"50"` for a percent channel); the number is
  clamped to the channel's range and rounded to 2 decimals and set on the value (`setColorChannel`;
  for a `null` value, on black in the field's space); a text that is no number, or empty, changes
  nothing and goes back to the value's text (a color always has every channel: the channel mode has
  no `null` of its own).
- The keys are the APG spinbutton's, with the channel's steps: ArrowUp / ArrowDown ± step (Shift:
  the large step), Page Up / Page Down ± large step, Home / End to `min` / `max`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-readonly`, `data-required`, `data-channel` (channel mode), the Field's state attributes |
| Input | `id`, `type="text"`, `autocomplete="off"`, `autocorrect="off"`, `spellcheck="false"`, `value` (the text), `disabled`, `readonly` and `aria-readonly="true"`, `aria-required="true"` when required, the Field's `aria-labelledby` / `aria-describedby` / `aria-invalid`, the Root's data attributes. Channel mode: `role="spinbutton"`, `inputmode="decimal"`, `aria-valuenow` (the channel's value; absent for `null`), `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (the channel's text) |
| hidden input | `type="text"`, visually hidden, `aria-hidden="true"`, `tabindex="-1"`, `name`, `value` (hex mode: the hex, `""` for `null`; channel mode: the channel's number), `required`, `disabled` |

## Focus

The Input is the one tab stop. The hidden input, focused by the browser's validation of a required
empty field, hands the focus to the Input (NumberField's).

## Forms and Field

The hidden input submits the value (`color=#336699`; channel mode `hue=200`), is `required` when
the field is, and a form reset returns an uncontrolled field to its `defaultValue` (reason `none`)
and its text with it. Inside a [Field](field.md) it is a Field control (the Field's `name`, label,
description, disabled, validation; `ENTRY_DEPENDENCIES` `["field"]`).

A controlled field the consumer refuses (spec/README.md): after a commit the text shows the
consumer's value.

## Server rendering

The text and the hidden input's value are rendered from the value.

## Scenarios

### `/color-field/basic`

A `<form>`: a `<label for="color">` **"Color"** and a ColorField (`id` `"color"`) with
`defaultValue` `"#336699"`, `name` `"color"`; a **"Submit"** button. Output: `value: ...`
(`formatColor(color, "hex")`, `none` for `null`), `form: ...`.

Checks:

1. A `textbox` named "Color" with the text `#336699`.
2. Typing `f00` (over the text) changes nothing but the text; Enter commits it: the text `#ff0000`,
   `value: #ff0000`.
3. Typing `nonsense` and Tab: the text goes back to `#ff0000`, the value unchanged.
4. Typing `rgb(0, 0, 255)` and Tab: the text `#0000ff`, `value: #0000ff`.
5. Focused, ArrowUp: `#000100` (the value too); ArrowDown: `#0000ff`.
6. "Submit": `form: color=#0000ff`.
7. Emptying the text and Tab: `value: none`, the text empty; "Submit": `form: color=`.
8. Axe finds no violation.

### `/color-field/channel`

A `<form>`: a ColorField with `channel` `"hue"`, `defaultValue` `"hsl(120, 50%, 50%)"`, `locale`
`"en-US"`, `name` `"hue"`, its Input `aria-label` **"Hue"**; a **"Submit"** button. Output: `value:
...` (`formatColor(color, "css")`), `form: ...`.

Checks:

1. A `spinbutton` named "Hue": `aria-valuenow` 120, min 0, max 360, `aria-valuetext` `"120°"`, the
   text `120°`.
2. Focused: ArrowUp → 121 (`value: hsl(121, 50%, 50%)`), Page Up → 136, Page Down → 121, Home → 0,
   End → 360.
3. Typing `200` and Enter: the text `200°`, `value: hsl(200, 50%, 50%)`; "Submit": `form: hue=200`.
4. Typing `400` and Tab: `360°` (clamped); typing `abc` and Tab: back to `360°`.

### `/color-field/field`

A `<form>`: a `Field.Root` with `name` `"brand"`: a `Field.Label` **"Brand color"**, a ColorField
with `defaultValue` `"#ff0000"`, a `Field.Description` **"A hex color."**; a **"Submit"** button.
Output: `form: ...`.

Checks: a textbox named "Brand color" and described by "A hex color."; "Submit": `form:
brand=#ff0000`.

## Differences from React Aria

- `parseColor` returns `null` and the text reverts on a wrong commit (React Aria's field keeps the
  wrong text until the next blur too, and also reverts).
- The hex is written lower-case, with its alpha when below 1 (spec/color.md, "Formatting").
- No `aria-roledescription` and no channel name: copy this library never renders.
