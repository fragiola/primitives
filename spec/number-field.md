# NumberField

## Purpose

A text field for a number (the APG `spinbutton` pattern): the user types it in the locale's own
writing (grouping, decimal separator, digits, currency, percent), or steps it with the keyboard,
the Increment and Decrement buttons (pressed once or held), the mouse wheel (opt-in) or a scrub
area dragged along. Its value is a number or `null` (empty). It works in a native `<form>` and in a
[Field](field.md). A value chosen along a track is a [Slider](slider.md); a value only shown is a
[Meter](meter.md).

**Scope: stage 2** (Epic #52, Issue #50). The APG spinbutton decides the role, the values and the
keys; Base UI's `NumberField` (1.9) decides the parts, the props, the stepping, the auto repeat,
the scrub and the change reasons (D4). The toolkit's `/number` mechanism holds the parsing and
formatting of localized text, the stepping, the auto repeat and the scrub: only NumberField
imports it.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| NumberField.Root | `div` | `number-field-root` | holds the value; renders the hidden input after its children |
| NumberField.Group | `div` | `number-field-group` | `role="group"`: the Input with its buttons |
| NumberField.Input | `input` | `number-field-input` | the `spinbutton`: a text input showing the formatted value |
| NumberField.Increment | `button` | `number-field-increment` | steps up; out of the tab order |
| NumberField.Decrement | `button` | `number-field-decrement` | steps down; out of the tab order |
| NumberField.ScrubArea | `span` | `number-field-scrub-area` | a press dragged along it steps the value |
| NumberField.ScrubAreaCursor | `span` | `number-field-scrub-area-cursor` | inside the ScrubArea: the virtual cursor while the pointer is locked, in a portal into `body` |
| (hidden input) | `input type="number"` | `number-field-hidden-input` | rendered by the Root; what the form submits and validates |

One entry, `/number-field` (D8), built on Field (`ENTRY_DEPENDENCIES`: `number-field` on `field`).

## API

**NumberField.Root**:

- `value`, `defaultValue` (`null`), `onValueChange(value, details)`: a number, or `null` for an
  empty field. `details` is `{ reason, event }` (spec/README.md, "Change details"), not
  cancelable.
- `min`, `max`: the bounds (none when not given). Every step, the buttons, the keys, the wheel and
  the scrub stay inside them; a typed value is clamped on blur (`clampOnBlur`).
- `step` (`1`), `smallStep` (`0.1`), `largeStep` (`10`): the amount of a step; Alt makes it
  `smallStep`, Shift `largeStep`, and Page Up / Page Down step by `largeStep` (Base UI).
- `snapOnStep` (`false`): a step from a value off the grid goes to the grid's next point in its
  direction (the grid of the step's amount, counted from `min`, else from 0): `1.5` up by `1`
  gives `2` (Base UI).
- `clampOnBlur` (`true`): on blur, a typed value outside `[min, max]` is clamped (reason
  `input-blur`). With `false`, it stays, and the hidden input's native validity reports it
  (`rangeUnderflow`, `rangeOverflow`: a Field shows it, a native form refuses it); the Issue's
  name for Base UI's `allowOutOfRange`, inverted.
- `format` (`Intl.NumberFormatOptions`): how the Input writes the value (and reads what is typed,
  "Typing"). Without it, the plain number in the locale's writing with every decimal it has
  (`maximumFractionDigits: 20`).
- `locale` (BCP 47): the locale of the format and the parsing. Without it, the runtime's default
  (as [Slider](slider.md)'s); a page rendered on a server passes `locale`.
- `allowWheelScrub` (`false`): the mouse wheel steps the value while the Input is focused and the
  pointer is over it (reason `wheel`).
- `required`, `readOnly`, `disabled` (`false`): a required field's hidden input is `required`; a
  read-only one is focusable and submitted but nothing changes it; a disabled one ignores every
  interaction and submits nothing.
- `name`: the hidden input's name. Inside a Field, the Field's `name` wins.
- `id`: the Input's `id` (generated unless the consumer gives one, or the Field's control id).

**NumberField.Input**: its value is the field's text; `inputMode` is `decimal`, or `numeric` when
the format writes no decimals (`maximumFractionDigits: 0`) and `min` is not negative. Its
accessible name is the consumer's (`aria-label`, a [Label](label.md) or `Field.Label`).

**NumberField.Increment**, **NumberField.Decrement**: no props of their own; their accessible
name is the consumer's (`aria-label`; no text, spec/README.md).

**NumberField.ScrubArea**: `direction` (`"horizontal"`, or `"vertical"`), `pixelSensitivity`
(`2`, the pixels a step takes). Its children are its content (a label, an icon).

**NumberField.ScrubAreaCursor**: its children are its content (an icon). Rendered only while a
mouse scrubs with the pointer locked.

**NumberField.Group**: no props.

Change reasons (spec/README.md): `input-change` (typed or pasted text that is a number),
`input-clear` (the text was emptied), `input-blur` (the blur clamped the typed value),
`keyboard` (a key stepped it), `increment-press`, `decrement-press` (a button), `wheel`,
`scrub`, `none` (a form reset).

### Typing

The Input is a text input (`type="text"`): the browser's own editing stays (APG). Each change of
its text:

1. is **refused** when it holds a character that no number of the locale and format is written
   with (the toolkit's `isNumberText`): the text stays as it was, nothing is reported. Allowed:
   the ASCII digits and the locale's (Arabic-Indic, ...), its group and decimal separators, `.`
   and `,` where the locale groups with neither, the minus and plus signs, whitespace, and the
   format's own text (currency, unit, percent sign);
2. is **kept** as typed otherwise. When it reads as a number (the toolkit's `parseNumber`: the
   locale's digits and separators, any minus sign, the format's text dropped, a percent format's
   `25%` read as `0.25`), the value changes to it (reason `input-change`, not clamped yet); when
   it holds no digit (`""`, `"-"`), the value becomes `null` (`input-clear`, only from `""`;
   a lone sign changes nothing); a text that is no number (`1.2.3`) changes nothing.

On **blur**, the value is clamped (`clampOnBlur`, reason `input-blur` when it changed) and the
text becomes the formatted value (empty for `null`). A step or a reset writes the formatted value
at once, and so does a controlled value while the Input shows no typed text; while the user is
typing, the text stays theirs until the blur (the consumer's value is then shown).

A `format` with `notation: "compact"` or `"scientific"` is not supported: its text (`1.5K`,
`1.2E3`) is refused as typed.

### Stepping

A step adds its amount and clamps to `[min, max]`; the result carries no floating-point noise
(`0.1 + 0.2` is `0.3`). A step from an empty field gives `0` clamped into the bounds (Base UI's
seed, no step added). A step that leaves the value unchanged (at a bound) reports nothing. A step
from typed text first reads that text.

### Forms

The Root renders one hidden `<input type="number">` after its children (`number-field-hidden-input`,
spec/README.md "Forms"): visually hidden, `aria-hidden="true"`, `tabindex="-1"`, with the field's
`name`, its value as a plain number (`1234.5`, empty for `null`), `min`, `max`, `step="any"`,
`required` and `disabled`. A native form submits it, validates it (`valueMissing`,
`rangeUnderflow`, `rangeOverflow`; no step validation: `smallStep`'s values are on no grid) and
resets it; a reset returns an uncontrolled field to its `defaultValue` (reason `none`) and writes
the rendered value back onto the hidden input (Radio's and Switch's write-back, docs/decisions.md).
When the hidden input is the form's first invalid control, the Input takes the focus.

### In a Field

The NumberField is a Field control (spec/field.md, "Integration contract"): its labelable element
is the Input (`id`, `for`); the Input gets `aria-labelledby`, `aria-describedby` and
`aria-invalid`; `validate` receives the value (a number or `null`); focus and blur come from the
Input (a press on a button or the scrub area keeps the focus where it is); the validated element
is the hidden input; the Field's state attributes are on every part.

## State attributes and ARIA

Every part carries the field's state: `data-disabled`, `data-readonly`, `data-required`,
`data-scrubbing` (while a scrub runs), and inside a Field its `data-invalid`, `data-valid`,
`data-dirty`, `data-touched`, `data-filled`, `data-focused`.

| part | attributes |
| --- | --- |
| Root | the state |
| Group | `role="group"` |
| Input | `role="spinbutton"`, `id`, `type="text"`, `inputmode`, `autocomplete="off"`, `autocorrect="off"`, `spellcheck="false"`, `aria-valuenow` (the value; absent while empty), `aria-valuemin` and `aria-valuemax` (when given), `aria-valuetext` (the formatted value; absent while empty), `aria-required="true"` when required, `aria-readonly="true"` and `readonly` when read-only, `disabled` when disabled |
| Increment, Decrement | `type="button"`, `tabindex="-1"`, `aria-controls` (the Input's `id`), `disabled` while the field is disabled or read-only, or its step would change nothing (the value at `max`, or at `min`) |
| ScrubArea | structural inline style `touch-action: none`, `user-select: none` (a touch drag scrubs, never scrolls; Base UI) |
| ScrubAreaCursor | structural inline style `position: fixed`, `top: 0`, `left: 0`, `pointer-events: none`, `transform: translate3d(<x>px, <y>px, 0)` (the virtual cursor's point) |

## Keyboard

On the Input (APG spinbutton; nothing happens while disabled or read-only, but the text editing
keys of a read-only input):

| key | does |
| --- | --- |
| ArrowUp, ArrowDown | step up or down by `step` (Shift: `largeStep`, Alt: `smallStep`) |
| PageUp, PageDown | step up or down by `largeStep` |
| Home | sets `min`, when given |
| End | sets `max`, when given |
| any other key | the input's own: typing, the caret, the selection (APG: no capture of the editing keys) |

Every key above prevents its default and reports reason `keyboard`. The keys are not mirrored in
RTL (up is up).

## Focus

The Input is the field's only tab stop (APG); the buttons are `tabindex="-1"`. A mouse press on a
button or on the ScrubArea keeps the focus where it is (its `mousedown` default is prevented).

## Pointer

- **Increment, Decrement**: a press steps once at once, then again every 60 ms once it lasted
  400 ms, until the pointer is released, canceled or leaves the button, or a bound is reached
  (the toolkit's `watchAutoRepeat`, Base UI's delays). A click that no pointer press started (the
  keyboard on a focused button, assistive technology) steps once. Alt and Shift choose the amount
  as for the keys.
- **Wheel** (`allowWheelScrub`): over the focused Input, a wheel move up steps up and a move down
  steps down (Shift: `largeStep`, Alt: `smallStep`), and the page does not scroll (a non-passive
  listener prevents it). Over an unfocused Input, the page scrolls as usual.
- **Scrub**: a press on the ScrubArea starts a scrub (`data-scrubbing` on every part): every
  `pixelSensitivity` pixels moved along `direction` (right, or up) steps once by the amount of the
  keys (Alt, Shift), reason `scrub`, until the release. A mouse asks for the pointer lock: the
  real cursor is hidden and the ScrubAreaCursor follows the movement, wrapping around the
  viewport's edges; a denied lock leaves the real cursor and renders no ScrubAreaCursor (the
  toolkit's `watchScrub`).

## Animation

None.

## RTL

The keys are not mirrored (a spinbutton's axis is vertical); the scrub's right is the screen's
right in either direction (Base UI). The parts follow the document's direction; the order of the
buttons is the consumer's markup.

## Scenarios

The form scenarios print the submission as `form: <key=value&...>` (spec/checkbox.md,
"Scenarios": `none` before any submission). Every scenario prints `value: <the last
onValueChange's value>` (`null` for `null`, `none` before any) and `reason: <its reason>` (`none`
before any).

### `/number-field/basic`

A native `<form>` with a NumberField, `id="quantity"`, `name="quantity"`, `defaultValue` `1`,
`min` `1`, `max` `10`, `largeStep` `5`, `locale="en-US"`, named by a [Label](label.md)
**"Quantity"** (`htmlFor="quantity"`): a Group with a Decrement (`aria-label` **"Decrease"**), the
Input and an Increment (`aria-label` **"Increase"**); buttons **"Submit"** (`type="submit"`) and
**"Reset"** (`type="reset"`).

Checks:

1. A `spinbutton` named "Quantity" with `aria-valuenow="1"`, `aria-valuemin="1"`,
   `aria-valuemax="10"`, `aria-valuetext="1"` and the text `1`; "Decrease" is disabled (at
   `min`), "Increase" is not; both are out of the tab order.
2. Focused, ArrowUp gives `2` (`reason: keyboard`); Shift+ArrowUp `7`; PageUp `10` (clamped,
   "Increase" disabled); ArrowUp then changes nothing; Home gives `1`, End `10`, PageDown `5`,
   ArrowDown `4`.
3. A click on "Increase" gives `5` (`reason: increment-press`) and the Input keeps the focus; a
   click on "Decrease" gives `4` (`decrement-press`).
4. Holding "Increase" pressed for 1 second steps it several times (the value passes `6`), and the
   value stops changing once it is released.
5. Typing: with the text selected, `8` gives `value: 8` (`input-change`); a letter typed after it
   is refused (the text stays `8`, the value too); `12` then a blur gives `10` (`input-blur`, the
   text `10`); emptying the text gives `value: null` (`input-clear`) and no `aria-valuenow`.
6. "Submit" with `8` gives `form: quantity=8`; empty, `form: quantity=`.
7. "Reset" returns it to `1` (the text `1`, `aria-valuenow="1"`); "Submit" then gives
   `form: quantity=1`.
8. Axe finds no violation.

### `/number-field/format`

Two NumberFields in the locale `?locale=` names (`en-US` without it), each named by a Label:

- **"Price"**: `format` `{ style: "currency", currency: "EUR" }`, `defaultValue` `1234.5`,
  `step` `0.5`;
- **"Discount"**: `format` `{ style: "percent" }`, `defaultValue` `0.25`, `step` `0.01`, `min` `0`,
  `max` `1`.

Output: `price: <value>`, `discount: <value>` (each field's last `onValueChange`, `none` before
any).

Checks, for `en-US`, `de-DE` and `ar-EG` (the expected texts are `Intl.NumberFormat`'s in the
page):

1. "Price" reads the locale's currency text (`€1,234.50`, `1.234,50 €`, `‏١٬٢٣٤٫٥٠ €`) and
   "Discount" its percent text (`25%`, `25 %`, `٢٥٪؜`); both have `aria-valuetext` equal to their
   text.
2. ArrowUp on "Price" gives `price: 1235` and the locale's text of `1235`; ArrowUp on "Discount"
   gives `discount: 0.26`.
3. Typing the locale's text replaces the value: `2,000.75` (en-US), `2.000,75` (de-DE),
   `٢٠٠٠٫٧٥` (ar-EG) give `price: 2000.75`, and the blur writes it back formatted; typing `30` in
   "Discount" gives `discount: 0.3` (`30%`).

### `/number-field/format?locale=ar-EG&dir=rtl`

The same page in Arabic, right to left: the checks above hold (the keys are not mirrored).

### `/number-field/scrub`

A NumberField with `defaultValue` `100`, `allowWheelScrub`, `locale="en-US"`: a ScrubArea
(`data-testid="scrub"`) holding a Label **"Width"** (`htmlFor` the Input's `id`) and a
ScrubAreaCursor, then a Group with the Input.

Checks:

1. A press on the ScrubArea dragged 20 px to the right gives `value: 110` (`reason: scrub`), with
   `data-scrubbing` on the Root while the pointer is down and not once it is released; dragged
   10 px to the left from there, `105`.
2. With the Input focused and the pointer over it, a wheel move up gives `106` (`reason: wheel`)
   and a move down `105`; with the Input blurred, a wheel move over it changes nothing.

### `/number-field/field`

A native `<form>` with a `Field.Root name="guests"`: a Label **"Guests"**, a NumberField
`required`, `min` `1`, `max` `8`, `clampOnBlur={false}`, `locale="en-US"` (Group, Input, no
buttons), a Description **"Up to 8 guests."**, an Error **"Enter between 1 and 8 guests."** with no
`match` (shown for any invalid state); a button **"Submit"**.

Checks:

1. A `spinbutton` named "Guests", described by "Up to 8 guests.", empty.
2. "Submit" submits nothing (`form: none`), focuses the Input, sets `aria-invalid="true"` and
   shows the error.
3. Typing `3` hides the error (`data-valid` on the Root once validated); "Submit" gives
   `form: guests=3`.
4. Typing `12` and blurring keeps `12` (no clamp) and shows the error again (`rangeOverflow`);
   "Submit" submits nothing.
5. Axe finds no violation, before and after the failed submission.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Input is a textbox with `aria-roledescription="Number field"` | `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (APG spinbutton, D4); no role description (no text, spec/README.md) |
| Base UI's Increment and Decrement have `aria-label="Increase"` / `"Decrease"` | no name of their own (no text): the consumer's `aria-label` |
| Base UI's `allowOutOfRange` | `clampOnBlur` (`true`), its inverse (the Issue's name); steps always clamp, as Base UI's |
| Base UI's hidden input takes `step` | `step="any"`: `smallStep` and `largeStep` give values on no grid of `step`, which a native form would refuse |
| Base UI's `onValueCommitted`, `inputRef`, `form`, `teleportDistance`, cancelable change details, the `input-paste` reason | out of scope: a paste is `input-change` |
