# ToggleGroup

## Purpose

A set of [Toggles](toggle.md) that share one value: one pressed at a time, or several with
`multiple` (Base UI's ToggleGroup; the APG has no toggle group pattern, so its keys and focus are
the APG toolbar's: one tab stop, the arrows move between the toggles). A text alignment picker,
a set of text styles. A choice that must always hold one value is a
[RadioGroup](radio-group.md); a bar of mixed controls is a [Toolbar](toolbar.md), inside which a
ToggleGroup joins the toolbar's focus ([toolbar.md, "Nested composites"](toolbar.md#nested-composites)).

**Scope: stage 2** (Epic #49, Issue #47). Base UI's `ToggleGroup` (1.9) decides the parts, the
value (an array in every mode), `multiple`, `orientation` and `loopFocus`; the APG toolbar
decides the keys and the roving tab stop (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| ToggleGroup | `div` | `toggle-group-root` | the `group`; holds the value |

Its items are [Toggles](toggle.md) (`/toggle`), each with a `value`. One entry, `/toggle-group`
(D8), built on `/toggle` (the group's context is the Toggle's, `ENTRY_DEPENDENCIES`), as
`/radio-group` and `/radio`.

## API

**ToggleGroup**:

- `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the values of the pressed
  toggles, an array of strings in every mode (Base UI, as Accordion's). A press reports the new
  array with reason `none`. Without `multiple`, pressing a toggle replaces the value
  (`["center"]`) and pressing the pressed one empties it (`[]`). With `multiple`, a press adds
  or removes the toggle's value; a value pressed later comes last.
- `multiple` (`false`): several toggles may be pressed.
- `disabled` (`false`): every toggle is disabled. Inside a disabled Toolbar or Toolbar.Group, the
  group is disabled too.
- `orientation` (`"horizontal"`): the arrow keys ("Keyboard"); `data-orientation`.
- `loopFocus` (`true`): the arrows wrap from the last toggle to the first and back.

Inside a [Toolbar](toolbar.md), the group has no focus of its own: its `orientation` and
`loopFocus` are the toolbar's ([toolbar.md, "Nested composites"](toolbar.md#nested-composites)).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| ToggleGroup | `role="group"`, `data-orientation` (its own, or the enclosing Toolbar's), `data-multiple` with `multiple`, `data-disabled` while disabled. No `aria-orientation` (not allowed on a `group`). Its accessible name comes from the consumer (`aria-label`, `aria-labelledby`) |
| Toggle (in the group) | [toggle.md](toggle.md#state-attributes-and-aria), with the group's roving `tabindex`; `disabled` and `data-disabled` while the group is disabled |

## Keyboard

| key | horizontal | vertical |
| --- | --- | --- |
| Tab | enters the group at its tab stop; Tab again leaves it (one tab stop) | same |
| next toggle | ArrowRight (ArrowLeft in RTL) | ArrowDown |
| previous toggle | ArrowLeft (ArrowRight in RTL) | ArrowUp |
| Home / End | the first / last enabled toggle | same |
| Enter, Space | toggle the focused toggle (its native click) | same |

The arrows move the focus only, never the value (the APG toolbar; unlike a radio group). They
skip disabled toggles (a disabled Toggle is natively disabled, Base UI) and wrap with `loopFocus`;
without it, an arrow at an end keeps the focus where it is. The keys of the other orientation do
nothing. An arrow, Home or End with Alt, Control, Meta or Shift does nothing. The direction is the
[DirectionProvider](direction.md)'s, else the group's computed `direction`.

## Focus

A roving tab stop (APG toolbar): exactly one enabled toggle has `tabindex="0"`, every other
`-1`. The tab stop is the toggle that last had focus (an arrow, a click, a script), while it is
still enabled; else the first enabled toggle. Pressing never moves focus. On a server render,
before the toggles are known, every toggle has `tabindex="-1"`; once mounted the first enabled
one holds the tab stop (Tabs' rule, spec/tabs.md).

## Pointer

A click on a toggle presses or releases it and focuses it (it becomes the tab stop).

## Animation

None.

## RTL

In horizontal orientation, ArrowLeft moves to the next toggle and ArrowRight to the previous one;
Home and End do not change.

## Scenarios

The output prints `value: <the last onValueChange's values joined by ",">` (empty when none is
pressed; `none` before any change) and `reason: <its reason>` (`none` before any).

### `/toggle-group/basic`

A button **"Before"**; a ToggleGroup labelled **"Alignment"** (`aria-label`), uncontrolled,
`defaultValue={["left"]}`, with the Toggles **"Left"** (`left`), **"Center"** (`center`),
**"Right"** (`right`) and **"Justify"** (`justify`, disabled); a button **"After"**.

Checks:

1. A `group` named "Alignment" with four `button` roles; "Left" is pressed
   (`aria-pressed="true"`), the others are not; "Justify" is disabled.
2. Tab from "Before" focuses "Left"; Tab again focuses "After" (one tab stop); Shift+Tab comes
   back to "Left".
3. Focused on "Left": ArrowRight → "Center"; ArrowRight → "Right"; ArrowRight wraps to "Left"
   ("Justify" skipped); ArrowLeft wraps to "Right"; Home → "Left"; End → "Right"; ArrowDown and
   ArrowUp do nothing. No arrow changes the value (`value: none`).
4. The toggle that last had focus keeps the tab stop: focused on "Right", Tab goes to "After",
   Shift+Tab comes back to "Right".
5. A click on "Center" presses it and releases "Left" (`value: center`, `reason: none`); a second
   click on "Center" releases it (`value: ` empty).
6. Focused on "Right", Space presses it (`value: right`) and Enter releases it (`value: ` empty).
7. Axe finds no violation.

### `/toggle-group/basic?dir=rtl`

The same page right to left. Checks: focused on "Left", ArrowLeft → "Center", ArrowLeft →
"Right", ArrowRight → "Center"; Home → "Left", End → "Right".

### `/toggle-group/vertical`

A ToggleGroup labelled **"Text style"**, `multiple`, `orientation="vertical"`, `loopFocus`
`false`, whose `value` the fixture holds, starting at `["bold"]`, with the Toggles **"Bold"**
(`bold`), **"Italic"** (`italic`) and **"Underline"** (`underline`).

Checks:

1. The group has `data-orientation="vertical"` and `data-multiple`; "Bold" is pressed.
2. A click on "Italic" presses it and keeps "Bold" pressed (`value: bold,italic`); a click on
   "Bold" releases it alone (`value: italic`).
3. Focused on "Bold": ArrowDown → "Italic"; ArrowDown → "Underline"; ArrowDown stays on
   "Underline" (no loop); ArrowUp → "Italic"; ArrowRight and ArrowLeft do nothing; Home → "Bold";
   End → "Underline".
4. Axe finds no violation.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's `onValueChange` details can be canceled | not offered (spec/README.md: value changes are not cancelable) |
| Base UI's ToggleGroup inside a Toolbar keeps its own `orientation` in its state | it shows the toolbar's (`data-orientation`), since the toolbar's keys apply |
