# SegmentedControl

## Purpose

A row (or a column) of mutually exclusive segments, one of them checked, with an Indicator that
moves to the checked segment: a view switcher ("List", "Grid", "Board"), a density or a unit
picker. It is a choice of one value, not a set of panels: switching content with it is the app's
business ([Tabs](tabs.md) owns panels), and it is not a toolbar of toggles
([ToggleGroup](toggle-group.md) presses several or none, and its arrows move the focus only).

**Scope: stage 4** (Epic #91, Issue #90). The APG has no segmented control and Base UI has none:
the APG-closest behaviour is decided here (D4, the Epic's stop condition) and recorded in
`docs/decisions.md` ("Tags and choices"). A segmented control is a set of radios with a moving
mark (Zag/Ark's SegmentGroup and Kobalte's SegmentedControl are radio groups too; read, never
copied), so it takes the **APG radio group** whole, as [RadioGroup](radio-group.md) does:

- the Root is a `radiogroup`, each Item a `radio`; one tab stop (the APG's roving `tabindex`);
- every arrow key moves the focus to the next or previous enabled Item **and checks it**, wrapping
  (`loopFocus`), Left and Right swapped in RTL; Space checks the focused Item; disabled Items are
  skipped;
- it works in a native `<form>` (one hidden input carrying the value) and in a [Field](field.md).

Its Indicator is [Tabs](tabs.md)' Indicator applied to the checked Item: CSS variables with the
Item's box, logical and physical, measured on mount, when the value changes, when the Root or the
checked Item resizes and when the direction changes; and Base UI's opt-in
`renderBeforeHydration`, so a server-rendered page shows it in place before hydration.

Out of scope: a read-only state, deselecting the checked Item, Home and End (the APG radio group
has neither; RadioGroup has neither), several checked Items (that is a ToggleGroup).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `segmented-control-root` | the `radiogroup`; holds the value; the Indicator's containing block (a recipe gives it `position: relative`) |
| Item | `button` | `segmented-control-item` | a `radio` |
| ItemText | `span` | `segmented-control-item-text` | the Item's text, inside an Item; optional |
| Indicator | `span` | `segmented-control-indicator` | follows the checked Item, inside the Root; optional |
| (hidden input) | `input` | `segmented-control-input` | rendered by the Root as its last child; what the form submits |

One entry, `/segmented-control` (D8), built on no other component: it shares nothing with
RadioGroup's entries but the toolkit (`radioKeyTarget` in `/collection`, the form bridge in
`/form`) and each framework's own shared code (`hooks/`, `composables/`, `/internal`), so the
RadioGroup and Radio rows of `docs/size.md` stay as they are. A Field control
(`ENTRY_DEPENDENCIES`: `field`). Its Indicator's measurement is the toolkit's
`segmentIndicatorBox` and `placeSegmentIndicator` (`/collection`, beside the Tabs Indicator's).

The Indicator may sit anywhere inside the Root (the fixtures put it first, under the Items: the
recipe gives the Items `position: relative`, so they paint above it).

## API

**Root**:

- `value`, `defaultValue` (`null`: no Item checked), `onValueChange(value, details)`: the checked
  Item's `value` (a string), `null` for none. Reasons: `item-press` (a press on an Item, or on its
  `<label>`), `keyboard` (an arrow key, Space), `none` (a form reset).
- `disabled` (`false`): disables every Item.
- `required` (`false`): the form's validation fails while no Item is checked.
- `name`: the hidden input's name; the form submits `name=value` for the checked Item, nothing
  while none is checked (as a native radio set).
- `orientation` (`"horizontal"`): `"horizontal"` or `"vertical"`, set as `aria-orientation` and
  `data-orientation` on every part. It changes no key: every arrow key works in both (APG radio
  group).
- `loopFocus` (`true`): the arrows wrap from the last enabled Item to the first and back (APG).
  With `false`, they stop at the ends.

**Item**: `value` (required: its value, a string), `disabled` (`false`), `id`.

**ItemText**: nothing of its own (it reads its Item's state).

**Indicator**:

- `renderBeforeHydration` (`false`) and its script's `nonce` ("Server rendering"), as Tabs'.
- It exposes the checked Item's box, measured from the Root's **padding box** (where an absolute
  Indicator is placed from: the Root's border is left out), as ten structural CSS variables, in
  pixels: the logical `--segment-indicator-inset-inline-start` (from the Root's inline-start
  padding edge: its left in LTR, its right in RTL, the layout's direction),
  `--segment-indicator-inset-block-start`, `--segment-indicator-inline-size`,
  `--segment-indicator-block-size`, and the physical `--segment-indicator-left`, `-right`,
  `-top`, `-bottom` (the Item's offsets from the Root's left, right, top and bottom padding
  edges), `--segment-indicator-width` and `--segment-indicator-height` (the Item's border box).
- It is not rendered while no Item is checked, and is rendered once the checked Item is measured
  (at once with `renderBeforeHydration`), in every framework (Angular's is structural,
  `<span *segmentedControlIndicator>`, as the Tabs Indicator).
- It is measured again when the value changes, when the Root or the checked Item resizes (a
  `ResizeObserver` from the element's `defaultView`, on both), and when the direction a
  DirectionProvider gives changes.

**Inside a [Field](field.md)** (its integration contract), as RadioGroup: the Root is the field's
control. The Field's Label names it (`aria-labelledby`), its description and errors describe it
(`aria-describedby`), `aria-invalid` is on the Root, the Root carries the field's state
attributes, and `validate` receives the value (or `null`). The Root takes the field's `name` and
`disabled`. Focus and blur are the focus entering and leaving the Root (`touched` once it left).
The validated element is the hidden input, so `required` blocks a native submission inside a
Field too. Focus target: the tab stop.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="radiogroup"`, `aria-orientation` and `data-orientation`, `aria-required="true"` and `data-required` when required, `aria-disabled="true"` and `data-disabled` when disabled; inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes. Its accessible name comes from the consumer (`aria-labelledby`, `aria-label`) or the Field's Label |
| Item | `role="radio"`, `type="button"`, `aria-checked` (`"true"` or `"false"`), `tabindex` (`0` on the tab stop, `-1` on the others), `disabled` and `data-disabled` when disabled (itself or the Root), `data-checked` / `data-unchecked` (exactly one), `data-orientation` |
| ItemText | its Item's `data-checked` / `data-unchecked`, `data-disabled` |
| Indicator | `aria-hidden="true"`, `data-orientation`, `data-disabled` when the Root is disabled; the ten variables as its inline style |
| hidden input | `name` (while an Item is checked), `value` (the checked Item's, `""` for none), `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden; not `type="hidden"`, so the browser validates it) |

An Item's accessible name is its content (its ItemText), or the consumer's `aria-label`.

## Keyboard

As [RadioGroup](radio-group.md#keyboard) (the APG radio group), the toolkit's `radioKeyTarget`:

| key | action |
| --- | --- |
| Tab | enters the Root at the checked Item, else at its first enabled Item; Tab again leaves it (one tab stop) |
| ArrowRight, ArrowDown | moves the focus to the next enabled Item and checks it; from the last, to the first (`loopFocus`) |
| ArrowLeft, ArrowUp | moves the focus to the previous enabled Item and checks it; from the first, to the last (`loopFocus`) |
| Space | checks the focused Item, when it is not checked |
| Enter | does nothing (a native radio does not check on Enter, and the press is no form submission) |

**RTL** swaps ArrowRight and ArrowLeft (the next Item is on the left); ArrowDown and ArrowUp do
not change. The direction is the [DirectionProvider](direction.md)'s, else the Root's computed
`direction`. With `loopFocus` `false`, an arrow at an end does nothing. Every arrow works in both
orientations. A change from a key reports reason `keyboard`.

## Focus

The tab stop is the checked Item when it is enabled, else the first enabled Item: it has
`tabindex="0"`, every other Item `-1`. Before the Items registered (a server render), only a
checked Item has `tabindex="0"`. A disabled Root has no tab stop. When the browser's validation
finds the hidden input invalid, focus goes to the tab stop.

## Pointer

A press on an Item, or on a `<label>` for it, checks it and focuses it (reason `item-press`); a
press on the checked Item changes nothing. A disabled Item ignores both.

## Animation

The Indicator's variables change when the checked Item changes, so a CSS transition on them
animates it (the recipe transitions `inset-inline-start` and `width`).

## Forms

The Root renders, as its last child (spec/README.md, "Forms"), one visually hidden input: the
`name` (only while an Item is checked: none checked submits nothing, as a radio set), the value,
`required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`. Without a `name` it is still
rendered, so `required` and a Field work. A form reset returns an uncontrolled Root to its
`defaultValue`; a controlled one reports the default through `onValueChange` (reason `none`).

## RTL

The arrow keys, above. The Indicator's `--segment-indicator-inset-inline-start` is measured from
the Root's right padding edge (the computed direction, as the layout), so it equals
`--segment-indicator-right`.

## Server rendering

The Indicator follows a measurement, so a server renders none (it appears in place once the page
is hydrated). With **`renderBeforeHydration`** (Base UI's name, as Tabs'; Angular:
`*segmentedControlIndicator="true"`, with `nonce` in its microsyntax), a server render writes the
Indicator with a small inline script inside it that measures the checked Item (the Root's
`[data-primitives-part="segmented-control-item"][aria-checked="true"]`) as the page parses, sets
the ten variables and removes itself (the toolkit's self-contained `placeSegmentIndicator`), so
the hydration finds the Indicator as the browser renders it. **`nonce`**: the script's `nonce`
attribute, for a Content Security Policy that allows inline scripts by nonce (Angular falls back
to its `CSP_NONCE` provider, as the Tabs Indicator).

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios). Every Item holds
an ItemText with its label; every Root holds an Indicator as its first child. The recipe draws the
Indicator over the checked Item's whole box (`inset-inline-start`, `inset-block-start`,
`inline-size`, `block-size` from the variables) and gives the Items equal shares of the Root
(`flex: 1`).

### `/segmented-control/basic`

A `<form>` with a heading **"View"** that labels the Root (`aria-labelledby`), `name="view"`,
`defaultValue="list"`, an Indicator with `renderBeforeHydration`, and Items **"List"** (`list`),
**"Grid"** (`grid`), **"Board"** (`board`, `disabled`) and **"Timeline"** (`timeline`); buttons
**"Submit"** (`type="submit"`) and **"Reset"** (`type="reset"`). Output: `value: ...` (the last
`onValueChange`, `none` before any), `reason: ...`, `form: ...`.

Checks:

1. A `radiogroup` named "View" with `aria-orientation="horizontal"`; four `radio`s (the hidden
   input is not in the tree), "List" checked; "Board" disabled.
2. Tab from the page start focuses "List"; Tab again focuses "Submit"; Shift+Tab comes back to
   "List".
3. ArrowRight checks and focuses "Grid" (`value: grid`, `reason: keyboard`); ArrowRight again
   skips "Board" to "Timeline"; ArrowRight wraps to "List"; ArrowLeft wraps back to "Timeline";
   ArrowDown goes to "List", ArrowUp back to "Timeline". Each move leaves exactly one radio
   checked.
4. Space and Enter on the checked "Timeline" change nothing and submit nothing (`form: none`).
5. A click on "Grid" checks and focuses it (`value: grid`, `reason: item-press`); a click on
   "Board" (forced: it is disabled) does nothing.
6. "Submit" submits `form: view=list` on the first page load; with "Grid" checked,
   `form: view=grid`.
7. "Reset" returns the Root to "List" (`value: list`, `reason: none`).
8. The Indicator (the contract layer): `aria-hidden="true"`, `data-orientation="horizontal"`; its
   ten variables are the checked Item's box from the Root's padding box (the logical
   inline-start equals the left); after ArrowRight they are "Grid"'s; after the Root is widened
   (the test sets its inline `width`), they are "Grid"'s new box, larger than before.
9. Axe finds no violation.

The ssr layer also loads this page's server render with its scripts blocked (no hydration): the
Indicator is there, its script gone, its `--segment-indicator-inline-size` the width of "List",
and its box over "List".

### `/segmented-control/basic?dir=rtl`

The same page right to left. Checks: focused on "List", ArrowLeft checks "Grid", ArrowLeft again
"Timeline", ArrowRight "Grid"; ArrowDown "Timeline" (unchanged keys). The Indicator's
`--segment-indicator-inset-inline-start` equals its `--segment-indicator-right`, the checked
Item's distance from the Root's right padding edge. In the ssr layer, before hydration, the
Indicator's box is over "List".

### `/segmented-control/vertical`

A Root labelled by a heading **"Period"**, `orientation="vertical"`, `loopFocus` `false`,
`defaultValue="day"`, an Indicator, and Items **"Day"** (`day`), **"Week"** (`week`), **"Month"**
(`month`). Output: `value: ...`.

Checks:

1. The `radiogroup` has `aria-orientation="vertical"`; the Root, the Items and the Indicator have
   `data-orientation="vertical"`.
2. Focused on "Day", ArrowDown checks "Week" (`value: week`), ArrowRight checks "Month" (every
   arrow works), ArrowDown does nothing at the end (`loopFocus` `false`: "Month" stays checked
   and focused), ArrowUp checks "Week".
3. The Indicator's `--segment-indicator-top` equals its `--segment-indicator-inset-block-start`,
   the checked Item's offset from the Root's top padding edge, and `--segment-indicator-block-size`
   the Item's height.

### `/segmented-control/disabled`

A Root labelled by a heading **"View"**, `disabled`, `defaultValue="grid"`, an Indicator, Items
**"List"**, **"Grid"**, **"Timeline"** (`list`, `grid`, `timeline`); a button **"After"** after
it. Output: `value: ...`.

Checks:

1. The `radiogroup` has `aria-disabled="true"`; every `radio` is disabled; "Grid" is checked.
2. Tab from the page start focuses "After" (no tab stop in the Root).
3. A click on "List" (forced) does nothing (`value: none`, "Grid" stays checked).
4. The Root, every Item, every ItemText and the Indicator have `data-disabled`; the Indicator
   still follows "Grid".

### `/segmented-control/field`

A `<form>` with a `Field.Root`: a `Field.Label` **"Density"**, a Root `required`, `name="density"`
with no default, an Indicator and Items **"Compact"** (`compact`), **"Comfortable"**
(`comfortable`), **"Spacious"** (`spacious`), a `Field.Description` **"Spacing of the rows."**, a
`Field.Error` **"Choose a density."**; buttons **"Submit"** and **"Reset"**. Output: `form: ...`.

Checks:

1. A `radiogroup` named "Density", described by "Spacing of the rows.", `aria-required="true"`,
   not `aria-invalid`; no radio checked and no Indicator rendered.
2. "Submit" submits nothing (`form: none`), focuses "Compact", makes the `radiogroup`
   `aria-invalid="true"` and shows "Choose a density.".
3. A click on "Comfortable" checks it and hides the error; "Submit" submits
   `form: density=comfortable`.
4. "Reset" returns it to no radio checked, with no Indicator; "Submit" submits nothing again.
5. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no SegmentedControl. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| Roles and keys | the APG radio group whole: a `radiogroup` of `radio`s, every arrow moves and checks, RTL swaps Left and Right, `loopFocus` (`true`), no Home and End | the APG's pattern for one choice of several (Zag/Ark and Kobalte are radio groups too); RadioGroup's keys, so the two behave alike |
| The element | a `button` per Item (`type="button"`) | RadioGroup's Radio: labelable, natively disabled |
| `orientation` | `"horizontal"` by default and always set (Zag's), changing no key | a segmented control is drawn along an axis, which the Indicator and a recipe read; the APG's arrows work in both |
| Change reasons | `item-press`, `keyboard`, `none` | the library's reasons for a press and a key (RadioGroup reports `none`, Base UI's group) |
| The hidden input | one visually hidden input, its `name` only while an Item is checked | one value (Listbox's single input), submitting nothing while none is checked (a native radio set) |
| The Indicator's variables | ten `--segment-indicator-*`, logical and physical, from the Root's padding box | the Issue's names; Tabs' set of ten; the padding box is where an absolute Indicator is placed from, so a bordered Root needs no correction (Tabs measures its List's border box) |
| `renderBeforeHydration`, `nonce` | offered, off by default | Tabs' Indicator (Base UI's): a view switcher is often at the top of a server-rendered page |
| Read-only, deselecting, Home and End | not offered | out of scope (the APG radio group has none of them) |
