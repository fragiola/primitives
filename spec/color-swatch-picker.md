# ColorSwatchPicker

## Purpose

Choose one color from a palette (Epic #101, Issue #100): the **APG `listbox`** (single selection)
of swatches laid out in wrapping rows, as a form control alone or in a [Field](field.md). It is
built on the toolkit's collections mechanism (`@fragiola/primitives/selection`, Listbox's: the list
model, the selection rules, the key map) and reads its colors with `/color`, through each
framework's own code (it never imports Listbox's entry). Inside a [ColorPicker](color-picker.md) it
shows and sets the picker's color. React Aria's ColorSwatchPicker (a ListBox with a grid layout) is
the behaviour reference; Base UI has no swatch picker.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `color-swatch-picker-root` | the `listbox`; holds the value; renders the hidden input as its last child |
| Item | `div` | `color-swatch-picker-item` | an `option`, focusable (roving `tabindex`); its content is the app's (a [ColorSwatch](color-swatch.md)) |
| (hidden input) | `input type="hidden"` | `color-swatch-picker-input` | what the form submits |

## API

**Root**:

- `value`, `defaultValue` (`Color | string | null`; default `null`: none selected),
  `onValueChange(color, details)`: the chosen Item's color (`parseColor` of its `value`). Reasons:
  `item-press`, `keyboard`, `none` (a form reset).
- `disabled`: every option is disabled and none takes focus.
- `name`: the hidden input's (a Field's wins).

**Item**: `value` (`Color | string`, required): its color; `disabled`.

An Item is **selected** when its color is the value's, compared as `formatColor(color, "hexa")`
(so an `hsb` value selects the `#ff0000` Item of the same color, React Aria's rule).

Not offered (Listbox has them): `multiple` (a palette chooses one color), `selectionBehavior` (the
APG's recommended toggle model only), `loopFocus` (the arrows along a row always wrap, Listbox's
default), `required` (a palette's choice is optional; a Field validates through `validate`),
typeahead (a swatch has no text), Groups and Separators.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="listbox"`, `aria-orientation="horizontal"`, `aria-disabled="true"` and `data-disabled` when disabled; in a Field, its ids (`aria-labelledby`, `aria-describedby`, `aria-invalid`) and states |
| Item | `role="option"`, an `id`, `tabindex` (`0` on the tab stop, `-1` on the others), `aria-selected` (`"true"` or `"false"`), `aria-disabled="true"` and `data-disabled` when disabled, `data-selected`, `data-highlighted` on the focused option while the focus is in the list; structural style `--color-swatch-picker-item-color` (`formatColor(color, "css")`) |
| hidden input | `type="hidden"`, `name`, `value` (`formatColor(color, "hex")`, `""` with none), `disabled` |

The Root's name comes from the app (`aria-label`, `aria-labelledby`) or a `Field.Label`. An
option's name is its content's: the ColorSwatch inside it (`role="img"`, named).

## Keyboard

DOM focus moves to the options (roving `tabindex`), Listbox's toggle model in single selection:

| key | action |
| --- | --- |
| Tab into the list | focuses the selected option, else the first one |
| ArrowRight / ArrowLeft | the next / previous option (swapped in RTL), wrapping from the last to the first and back |
| ArrowDown / ArrowUp | the option in the row below / above whose horizontal center is the nearest (`rowTarget`, measured on the rendered boxes); nothing on the last / first row |
| Home / End | the first / last option |
| Space, Enter | selects the focused option (pressing the selected one keeps it) |
| Tab | leaves the list |

A focus move never changes the selection (the APG's recommended model). Disabled options take focus
but are never selected (Listbox's rule).

**The rows (the Issue's "grid layout keyboard (arrows in 2D)", decided here).** The APG listbox
moves along one axis; a palette is laid out in rows by the app's CSS, so the vertical arrows move
between rows as React Aria's grid layout does. The rows are read from the rendered boxes (the
toolkit's `rowTarget`), not from a `columns` prop, so any wrapping layout works. A `grid` role
(rows and gridcells) was discarded: a palette is a choice of one value, the listbox's semantics,
and React Aria keeps the listbox. The arrows along a row wrap (Listbox's `loopFocus`); between rows
they stop (a column has no next row to wrap to).

## Pointer

A press on an option focuses it and selects it (`item-press`); a press on a disabled one focuses it
and selects nothing.

## Focus

As Listbox's: the tab stop is the focused option while the focus is inside; once it leaves, the
next Tab lands on the selected option, else the first. Before the options are known (a server
render), every option has `tabindex="-1"`; once mounted the tab stop is computed (Angular's
options register as they render, so its server render has it already; the hydrated pages end the
same).

## Forms and Field

With a `name` the hidden input submits the selected color as hex (`#rrggbb`, `#rrggbbaa` below
full alpha), or `""`. A form reset returns an uncontrolled picker to its `defaultValue` (reason
`none`). In a Field the Root is the field's control (RadioGroup's and Listbox's way): named by the
`Field.Label`, described by the field; focus and blur are the focus entering and leaving the list;
`validate` gets the value; the field's `name` and `disabled` win (`ENTRY_DEPENDENCIES`
`["field"]`).

**In a ColorPicker** (spec/color-picker.md): with neither `value` nor `defaultValue` the picker
binds it: the selected option is the one of the picker's color, and a choice sets the picker's
color (and commits it). It renders no hidden input of its own there (the picker's submits), and the
picker's `disabled` disables it.

## RTL

ArrowLeft and ArrowRight swap (the direction provider, else the computed direction); the rows'
arrows do not change.

## Scenarios

The swatches: **Red** `#ff0000`, **Orange** `#ff8000`, **Yellow** `#ffff00`, **Green** `#00ff00`,
**Cyan** `#00ffff`, **Blue** `#0000ff`, **Purple** `#8000ff`, **Gray** `#808080` (disabled): each
an Item holding a ColorSwatch with `aria-label` (its name) and the same `color`. The Root lays them
out in rows of four (32 px swatches, 8 px apart, 160 px wide). Output values print the value as
`formatColor(color, "hex")`, and `none` for `null`.

### `/color-swatch-picker/basic`

A `<form>`: a heading **"Palette"** (`id`) names the Root (`aria-labelledby`), `name` `"color"`; the
swatches; a **"Submit"** button. Output: `value: ...`, `reason: ...`, `form: ...`.

Checks:

1. A `listbox` named "Palette", `aria-orientation="horizontal"`; eight options named by their
   swatches, every one `aria-selected="false"`; "Gray" has `aria-disabled="true"`; the Item's
   `--color-swatch-picker-item-color` is its color.
2. Tab from the page start focuses "Red"; ArrowRight focuses "Orange" without selecting (`value:
   none`), with `data-highlighted`.
3. Space selects "Orange" (`value: #ff8000`, `reason: keyboard`, `aria-selected="true"`,
   `data-selected`); ArrowDown focuses "Blue" (below it), Enter selects it (`value: #0000ff`),
   "Orange" is unselected.
4. ArrowUp focuses "Orange"; ArrowUp again stays on "Orange" (the first row); End focuses "Gray";
   ArrowDown stays; Space does nothing (`value: #0000ff`); ArrowRight wraps to "Red"; ArrowLeft
   wraps back to "Gray"; Home focuses "Red".
5. Tab moves to "Submit"; Shift+Tab comes back to the selected "Blue".
6. A click on "Yellow" selects and focuses it (`value: #ffff00`, `reason: item-press`); a click on
   "Gray" (forced: it is disabled) focuses it and selects nothing.
7. "Submit": `form: color=#ffff00`.
8. Axe finds no violation.

### `/color-swatch-picker/rtl?dir=rtl`

The picker of `/color-swatch-picker/basic` in a document with `dir="rtl"`.

Checks: focused on "Red", ArrowLeft focuses "Orange", ArrowRight "Red" again; ArrowDown focuses
"Cyan" (below "Red": the first swatch of each row is at the right).

### `/color-swatch-picker/field`

A `<form>`: a Field (`name` `"accent"`) with a `Field.Label` **"Accent"**, the picker with
`defaultValue` `"#00ff00"`, a `Field.Description` **"The links' color."**; a **"Submit"** button
and a **"Reset"** button (`type="reset"`). Output: `value: ...`, `form: ...`.

Checks:

1. The `listbox` is named "Accent" and described by "The links' color."; "Green" is selected.
2. "Submit": `form: accent=#00ff00`.
3. A click on "Blue" (`value: #0000ff`), "Submit": `form: accent=#0000ff`.
4. "Reset": "Green" is selected again (`value: #00ff00`).

## Differences from React Aria

- The rows are measured on the rendered boxes for ArrowUp / ArrowDown, as React Aria's grid layout,
  but the arrows along a row wrap (React Aria's stop).
- The hidden input submits the color as hex (React Aria's ColorSwatchPicker has no form value).
