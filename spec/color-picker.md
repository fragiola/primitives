# ColorPicker

## Purpose

Edit one color with several controls at once (Epic #101, Issue #100): a `Root` that holds a
[color](color.md) and shares it with the [ColorArea](color-area.md), [ColorSlider](color-slider.md),
[ColorWheel](color-wheel.md), [ColorField](color-field.md), [ColorSwatchPicker](color-swatch-picker.md)
and [ColorSwatch](color-swatch.md) placed inside it (React Aria's ColorPicker composition), with a
format switch, an eyedropper where the browser has one, and its form value. Inline, it renders in
the page; with the opt-in **ColorPickerPopover** entry (`/color-picker-popover`), a Trigger opens
it in a non-modal popup on Popover's overlay lifecycle. Neither the APG nor Base UI has a color
picker: the controls inside are the APG patterns their specs decide, the popup is the APG's
non-modal dialog (Popover's, spec/popover.md), and the rest takes the APG-closest option, decided
below. React Aria's ColorPicker (composition) and Zag/Ark's ColorPicker (the eyedropper, the format,
the popup) are the behaviour references, read and never copied.

**Two entries (D8, the Epic's bundle guard).** `/color-picker` holds the Root, the FormatSelect and
the EyeDropperTrigger: an inline picker bundles no overlay code. `/color-picker-popover` holds the
popup's parts (Root, Trigger, Portal, Positioner, Popup), built on each framework's overlay root,
the toolkit's `/overlay`, `/positioning`, `/focus` and `/presence`, never on Popover's entry; the
bundle guard fails when `/color-picker` imports `/overlay` or `/positioning`
(`MECHANISM_USERS`). One namespace with optional popup parts was discarded: its entry would carry
the overlay code into every inline picker.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-picker-root` | holds the color and the format; a `group`; renders the hidden input after its children |
| FormatSelect | `select` | `color-picker-format-select` | a native select of the format; its `option`s are the app's |
| EyeDropperTrigger | `button` | `color-picker-eye-dropper-trigger` | picks a color on screen; rendered only where `EyeDropper` exists |
| (hidden input) | `input type="hidden"` | `color-picker-input` | the color as hex, what the form submits |

`/color-picker-popover`:

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the open state (inside a ColorPicker's Root) |
| Trigger | `button` | `color-picker-popover-trigger` | toggles the popup and is its anchor; its content the app's (a ColorSwatch) |
| Portal | none | | moves the Positioner to the end of `body` (or a container) |
| Positioner | `div` | `color-picker-popover-positioner` | positions the popup next to the trigger |
| Popup | `div` | `color-picker-popover-popup` | the non-modal `dialog` holding the controls |

## API

**Root**:

- `value`, `defaultValue` (`Color | string`; default `"#000000"`), `onValueChange(color,
  details)`: the color, as the control that changed it reports it (each child reports the color in
  the space it edits, spec/color.md, "Channels").
- `onValueCommit(color, details)`: once a change is complete: a child slider's, area's or wheel's
  commit (a drag ended, a key changed it), a ColorField's commit, a ColorSwatchPicker's choice, an
  eyedropper's pick.
- `format`, `defaultFormat` (`"hex"`), `onFormatChange(format, details)`: `"hex"`, `"rgb"`,
  `"hsl"` or `"hsb"` (`ColorPickerFormat`), the FormatSelect's.
- `disabled`: every control inside is disabled; `name`: the hidden input's (a Field's wins).

**FormatSelect**: no props of its own; its children are the app's `<option value="hex">` (and
`rgb`, `hsl`, `hsb`), with their text (no text of its own: spec/README.md, "No text"); its name the
app's (`aria-label`, a `<label>`).

**EyeDropperTrigger**: its content and name are the app's.

**ColorPickerPopover.Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`,
`onOpenChangeComplete(open)`, the actions (`close()`, `unmount()`), as Popover's Root. No detached
triggers and no handle (one trigger per picker). **Trigger**: no props of its own (`disabled` from
the picker). **Portal**: `container`, `keepMounted`. **Positioner**: `side` (`"bottom"`), `align`
(`"start"`), `sideOffset`, `alignOffset`, `collisionPadding`, `anchor` (the DatePicker's defaults:
a picker's popup opens below its trigger, aligned to its start). **Popup**: its name is the app's
(`aria-label`, `aria-labelledby`).

Change reasons (spec/README.md): a child's own (`keyboard`, `track-press`, `drag`, `input-blur`,
`input-clear`, `item-press`); `input-change` for the FormatSelect's change (the format, and the
value it converts); `trigger-press` for an eyedropper's pick; `none` for a form reset. The popup's
are Popover's: `trigger-press`, `escape-key`, `outside-press`, `focus-out`.

## Sharing the color

A control inside a ColorPicker's Root **is bound to it when it has neither `value` nor
`defaultValue`**: it shows the picker's color and every change it makes sets the picker's (its own
`onValueChange` still fires, then the picker's), and its commits are the picker's. A control given
its own `value` or `defaultValue` keeps its own state, inside the picker as outside it (the Epic's
risk: a child used alone keeps its own state). React Aria's ColorPicker gives its value to every
child through their contexts, the child's own props winning; here the rule is the same, stated on
the value props, so a bound child never holds a stale copy.

A bound child: is disabled when the picker is; reads no [Field](field.md) (the picker is the
field's control, so a ColorSlider inside a Field's picker does not take the field's name or label);
renders no hidden form value of its own (ColorSlider's and ColorWheel's hidden inputs have no
`name`, a ColorSwatchPicker's none; the picker's submits); and is never reset by a form reset
itself (the picker is). A ColorField bound to the picker never commits `null`: an empty text goes
back to the picker's hex. A ColorSwatch with no `color` shows the picker's color.

The picker holds the color as the last control reported it, in that control's space; each control
converts it to the space it edits (spec/color.md: a gray's hue survives in the space that edits
it). The value never changes by itself.

## The format

The format is the picker's state for the app's channel controls: which fields to show
(`hex`: one hex ColorField; `rgb`: red, green and blue; `hsl`, `hsb`: hue, saturation and
lightness or brightness), as the theme picker example does. The FormatSelect sets it
(`input-change`) and **converts the value to the format's space** (`hex` and `rgb`: rgb; `hsl`;
`hsb`), reported with `onValueChange` when the space changes (Zag/Ark's rule): the channel controls
of the new format then edit the value in their space by default (spec/color.md, `colorSpaceFor`:
the value's own space when it has the channel). The color itself does not change, nor does the form
value (always hex, spec/color.md "Formatting"). A format set through the controlled `format`
converts nothing (the app holds both). `data-format` on the Root and the render state expose it.

Alternatives discarded: a FormatTrigger cycling the formats (Zag's second part: a button whose
meaning changes on every press, where a native select names its choices); a FormatSelect that
renders its own option text (copy).

## EyeDropperTrigger

The [EyeDropper API](https://wicg.github.io/eyedropper-api/) exists in Chromium browsers only. The
trigger renders **only where `window.EyeDropper` exists** (the toolkit's `supportsEyeDropper`,
checked once mounted: the server and the first render have none, so hydration matches), else
nothing (the Issue's "hidden otherwise"; no fallback, the Epic's out of scope). A press opens the
browser's eyedropper (`openEyeDropper`); a pick sets the picker's color (reason `trigger-press`)
**in the space of the current value, keeping its alpha** (a screen pixel has none: Zag's rule) and
commits it; a cancelled pick (Escape) changes nothing. Disabled with the picker.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="group"`, `data-format`, `data-disabled`; in a Field, its ids (`aria-labelledby`, `aria-describedby`, `aria-invalid`) and states; structural style `--color-picker-color` (`formatColor(color, "css")`) |
| FormatSelect | `value` (the format), `disabled` with the picker, `data-format`, `data-disabled` |
| EyeDropperTrigger | `type="button"`, `disabled` with the picker, `data-disabled` |
| hidden input | `type="hidden"`, `name`, `value` (`formatColor(color, "hex")`) |
| popover Trigger | `type="button"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (while open), `data-popup-open` while open, `disabled` and `data-disabled` with the picker, an `id`; structural style `--color-picker-color` |
| popover Positioner | Popover's: `role="presentation"`, `data-side`, `data-align`, `data-open` / `data-closed`, its CSS variables and structural style, `hidden` while kept mounted and closed |
| popover Popup | `role="dialog"` (no `aria-modal`), an `id`, `tabindex="-1"`, `data-side`, `data-align`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style` |

## Keyboard, focus and dismissal (the popup)

Popover's (spec/popover.md, D4 §3): Enter and Space on the Trigger toggle it; on open, focus moves
to the popup's first tabbable element, else the popup; Tab from its last tabbable element moves to
the element after the trigger and closes it (`focus-out`), Shift+Tab from its first returns to the
trigger and closes it; Escape closes it and focuses the trigger (a child layer first); a press
outside closes it (`outside-press`), focus returning to the trigger unless the press focused
something. Focus is not trapped and nothing outside is inert (a non-modal dialog). The Root's
hidden input stays in the page while the popup is closed, so the form always has the value.

The controls inside keep their own keys (spec/color-area.md, spec/color-slider.md, ...).

## Forms and Field

The hidden input submits the color as hex (`#rrggbb`, `#rrggbbaa` below full alpha). A form reset
returns an uncontrolled picker to its `defaultValue` (reason `none`) and with it every bound child.
In a Field the Root is the field's control (a `group`, RadioGroup's way): named by the
`Field.Label` (`aria-labelledby`), described by the field; focus and blur are the focus entering
and leaving it; `validate` gets the color; the field's `name` and `disabled` win
(`ENTRY_DEPENDENCIES` `["field"]`).

## RTL

The controls follow their own specs; the popup's sides follow Popover's.

## Server rendering

The hidden input, the CSS variable and the bound children's values are in place before hydration.
The EyeDropperTrigger renders once mounted only (its API is the browser's); a popover renders closed.

## Scenarios

The controls carry the names below as `aria-label` (a ColorArea's on its Inputs, a slider's on its
Thumb, a ColorField's on its Input); every control has `locale` `"en-US"`. Output values print a
color as `formatColor(color, "hex")`.

### `/color-picker/basic`

A `<form>`: a ColorPicker (`aria-label` **"Theme color"**, `defaultValue` `"hsb(210, 50%, 60%)"`,
`name` `"color"`) holding a ColorArea (`xChannel` `"saturation"`, `yChannel` `"brightness"`, Inputs
**"Saturation"** and **"Brightness"**), a hue ColorSlider (**"Hue"**), an alpha ColorSlider
(**"Opacity"**), a hex ColorField (**"Hex"**), a ColorSwatch (**"Current color"**), a
ColorSwatchPicker (**"Presets"**: **Red** `#ff0000`, **Green** `#00ff00`, **Blue** `#0000ff`), a
FormatSelect (**"Format"**: `hex` "Hex", `rgb` "RGB", `hsl` "HSL", `hsb` "HSB"), an
EyeDropperTrigger **"Pick a color"**, and a hue ColorSlider of its own (**"Own hue"**,
`defaultValue` `"hsl(0, 100%, 50%)"`); then **"Submit"** and **"Reset"** (`type="reset"`) buttons.
Output: `value: ...`, `space: ...` (the value's space), `committed: ...`, `format: ...`, `own:
...` (the own slider's last change, `formatColor(color, "css")`), `form: ...`.

Checks:

1. A `group` named "Theme color", `data-format="hex"`; "Hue" 210, "Saturation" 50, "Brightness"
   60, "Opacity" 1; "Hex" reads `#4d7399`; the "Current color" `img` has `--color-swatch-color`
   `hsl(210, 33.33%, 45%)`; the "Presets" options are all unselected; "Format" is `hex`; "Own hue"
   is 0; the hidden input `color` holds `#4d7399` and is the only named input.
2. "Hue" focused, ArrowRight → 211: `value: #4d7199`, `space: hsb`, `committed: #4d7199`; "Hex"
   reads `#4d7199`; "Own hue" is still 0.
3. "Own hue" focused, ArrowRight → 1: `own: hsl(1, 100%, 50%)`; the value is unchanged.
4. "Hex": `#ff0000` and Enter → `value: #ff0000`, `space: rgb`, `committed: #ff0000`; "Hue" 0,
   "Saturation" 100, "Brightness" 100; "Red" is selected.
5. A click on "Green" → `value: #00ff00`, `committed: #00ff00`; "Green" is selected, "Red" not;
   "Hue" 120.
6. "Opacity" focused, Home → 0: `value: #00ff0000`; End → `value: #00ff00`.
7. "Format" set to `hsl` → `format: hsl`, `data-format="hsl"`, `space: hsl`, `value: #00ff00`.
8. "Submit": `form: color=#00ff00`.
9. "Reset": "Hue" 210, "Hex" `#4d7399`, `value: #4d7399`, "Own hue" 0; "Format" stays `hsl`
   (the format is no form value).
10. Axe finds no violation.

**The eyedropper** (the same page): with `window.EyeDropper` removed before the page loads, there
is no "Pick a color" button; with a stub whose `open()` resolves `{ sRGBHex: "#336699" }`, a click
on "Pick a color" → `value: #336699`, `space: hsb` (the value's space kept), `committed: #336699`;
"Opacity" set to 0.5 first → the pick keeps it (`value: #33669980`); a stub that rejects (a
cancelled pick) changes nothing.

### `/color-picker/popover`

A `<form>`: a ColorPicker (`defaultValue` `"#336699"`, `name` `"accent"`) holding a
ColorPickerPopover: its Trigger (`aria-label` **"Accent color"**) holds a ColorSwatch; its Portal,
Positioner and Popup (`aria-label` **"Accent color picker"**) hold a ColorArea (Inputs
**"Saturation"**, **"Brightness"**), a hue ColorSlider (**"Hue"**) and a hex ColorField
(**"Hex"**). Then **"After"** and **"Submit"** buttons. Output: `value: ...`, `open: ...`, `reason:
...` (the last open change's).

Checks:

1. A button "Accent color" with `aria-haspopup="dialog"`, `aria-expanded="false"`; no dialog; its
   ColorSwatch's `--color-swatch-color` is `rgb(51, 102, 153)`.
2. A click on it opens the dialog "Accent color picker" (`open: true`, `reason: trigger-press`),
   the trigger `aria-expanded="true"`, `aria-controls` the popup's id, `data-popup-open`; focus on
   "Saturation" (the first tabbable).
3. ArrowRight → `value: #316599`; the trigger's swatch follows.
4. Escape closes it (`reason: escape-key`), focus on the trigger.
5. Enter opens it again; Tab moves to "Hue", Tab to "Hex", Tab closes it (`reason: focus-out`)
   and focuses "After".
6. Opened again, a click on the page's empty area closes it (`reason: outside-press`), focus on
   the trigger.
7. "Submit" (closed): `form: accent=#316599`.
8. Opened, axe finds no violation.

### `/color-picker/field`

A `<form>`: a Field (`name` `"brand"`) with a `Field.Label` **"Brand color"**, a ColorPicker
(`defaultValue` `"#336699"`) holding a hue ColorSlider (**"Hue"**, `name` `"hue"`) and a
ColorSwatch, a `Field.Description` **"Used for links."**; a **"Submit"** button. Output: `value:
...`, `form: ...`.

Checks:

1. The `group` is named "Brand color" and described by "Used for links."; the slider is named
   "Hue" (not by the Field's label).
2. "Submit": `form: brand=#336699` (the slider's own `name` submits nothing: it is bound).
3. "Hue" focused, ArrowRight → 211: `value: #336499`; "Submit": `form: brand=#336499`.

### `/color-picker/disabled`

A ColorPicker with `disabled` (`defaultValue` `"#336699"`) holding a hue ColorSlider (**"Hue"**), a
ColorSwatchPicker (**"Presets"**: Red, Green), a FormatSelect (**"Format"**), an EyeDropperTrigger
**"Pick a color"** and a ColorPickerPopover Trigger **"Open picker"** (its popup holds a ColorField
**"Hex"**).

Checks: the Root has `data-disabled`; "Hue" has `aria-disabled="true"` and no `tabindex`; the
"Presets" listbox `aria-disabled="true"`; "Format" and "Open picker" are disabled; with an
`EyeDropper` stub, "Pick a color" is disabled; a click on "Open picker" opens nothing.

## Differences from React Aria and Zag/Ark

- React Aria's ColorPicker renders no element and has no form value; here the Root is a `group`
  with a hidden input (the color as hex), so a picker is one form control.
- A child keeps its own state as soon as it has `value` or `defaultValue` (React Aria merges the
  picker's props under the child's, prop by prop).
- Zag/Ark's channel inputs, format trigger and swatch parts are the existing components here
  (ColorField's channel mode, the FormatSelect, ColorSwatch).
- The popup is a separate entry (D8); Zag/Ark's lives in the picker's machine.
