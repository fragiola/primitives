# RadioGroup and Radio

## Purpose

A set of choices of which exactly one can be checked (APG `radio` group): the arrow keys move the
focus and the check together, the group is one tab stop. It works in a native `<form>`: it
submits, resets and validates as a set of `<input type="radio">` of one `name` would. A radio
outside a group, a group of radios inside a toolbar and a read-only group are out of scope.

**Scope: stage 1** (Epic #29). The APG radio group decides the keyboard and the focus; Base UI's
`RadioGroup` and `Radio` (1.9) decide the parts, the hidden inputs and `loopFocus`'s off state
(D4). `orientation` and `loopFocus` are this library's names (spec/README.md).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| RadioGroup | `div` | `radio-group-root` | the `radiogroup`; holds the value |
| Radio.Root | `button` | `radio-root` | a `radio`; must be inside a RadioGroup |
| Radio.Indicator | `span` | `radio-indicator` | the dot; rendered only while checked |
| (hidden input) | `input type="radio"` | `radio-input` | rendered by each Root right after its element; what the form submits |

Two entries (D8): `/radio-group` (`RadioGroup`) and `/radio` (`Radio.Root`, `Radio.Indicator`),
as [Checkbox](checkbox.md)'s `/checkbox` and `/checkbox-group`. The hidden inputs are visually
hidden, `aria-hidden="true"` and `tabindex="-1"`, as a checkbox's.

## API

**RadioGroup**:

- `value`, `defaultValue` (none: no radio checked), `onValueChange(value, details)`: the checked
  radio's `value` (a string). A change reports reason `none` (spec/README.md; Base UI does the
  same).
- `disabled` (`false`): disables every radio.
- `required` (`false`): the form's validation fails while no radio is checked.
- `name`: every radio's hidden input takes it; the form submits `name=value` for the checked one,
  nothing while none is checked.
- `orientation` (none): `"horizontal"` or `"vertical"`, set as `aria-orientation` and
  `data-orientation`. It changes no key: every arrow key works in both (APG).
- `loopFocus` (`true`): the arrow keys wrap from the last radio to the first and back (APG). With
  `false`, they stop at the ends.

**Radio.Root**: `value` (required: its value in the group), `disabled` (`false`), `id`.

**Radio.Indicator**: `keepMounted` (`false`): when `true`, it is rendered in every state.

**Inside a [Field](field.md)** (its integration contract): the RadioGroup is the field's control,
as a CheckboxGroup. The Field's Label names the group (`aria-labelledby`), its description and
errors describe it (`aria-describedby`), `aria-invalid` is on the group, the group carries the
field's state attributes, and `validate` receives the value (or `null`). The group takes the
field's `name` and `disabled`. The validated element is the first enabled radio's hidden input
(radios of one name share their validity), so `required` blocks a native submission inside a
Field too. Focus target: the checked radio, else the first enabled one.

A form `reset` returns an uncontrolled group to its `defaultValue`; a controlled one reports the
default through `onValueChange` (reason `none`).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| RadioGroup | `role="radiogroup"`, `aria-required="true"` when required, `aria-disabled="true"` and `data-disabled` when disabled, `aria-orientation` and `data-orientation` when given, `data-required`; inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes. Its accessible name comes from the consumer (`aria-labelledby`), or the Field's Label |
| Radio.Root | `role="radio"`, `type="button"`, `aria-checked` (`"true"` or `"false"`), `tabindex` (`0` on the group's tab stop, `-1` on the others), `disabled` and `data-disabled` when disabled (itself or the group), `data-checked` / `data-unchecked` (exactly one), `data-required` |
| Radio.Indicator | `aria-hidden="true"`, the same `data-checked` / `data-unchecked`, `data-disabled` |
| hidden input | `type="radio"`, `name`, `value`, `checked`, `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden) |

A Radio.Root's accessible name comes from the consumer: a `<label>` around it, `<label for>`, or
`aria-label`.

## Keyboard

| key | action |
| --- | --- |
| Tab | enters the group at the checked radio, else at its first enabled radio; Tab again leaves the group (one tab stop) |
| ArrowDown, ArrowRight | moves the focus to the next enabled radio and checks it; from the last, to the first (`loopFocus`) |
| ArrowUp, ArrowLeft | moves the focus to the previous enabled radio and checks it; from the first, to the last (`loopFocus`) |
| Space | checks the focused radio, when it is not checked |
| Enter | does nothing (a native radio does not check on Enter) |

**RTL** swaps ArrowRight and ArrowLeft (the "next" radio is to the left); ArrowDown and ArrowUp
do not change. The direction is the [DirectionProvider](direction.md)'s, else the group's
computed `direction`.

Disabled radios are skipped by the arrows. With `loopFocus` `false`, an arrow at an end does
nothing.

## Focus

The group's tab stop is its checked radio when it is enabled, else its first enabled radio:
that radio has `tabindex="0"`, every other `-1`. When validation fails on a required group (the
browser's `invalid` event on its first hidden input), focus moves to the group's tab stop.

## Pointer

A click on a Radio.Root, or on its `<label>`, checks it and focuses it. A disabled radio ignores
both.

## Animation

None of its own.

## RTL

The arrow keys, above. Nothing else changes.

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios).

### `/radio-group/basic`

A `<form>` with a RadioGroup labelled by a heading **"Plan"** (`aria-labelledby`),
`name="plan"`, `required`, no default: radios **"Free"** (`free`), **"Pro"** (`pro`),
**"Team"** (`team`, `disabled`) and **"Enterprise"** (`enterprise`), each a Radio.Root with its
Indicator inside a `<label>` with its text; buttons **"Submit"** (`type="submit"`) and
**"Reset"** (`type="reset"`). Output: `value: ...` (the last `onValueChange`, `none` before any),
`form: ...`.

Checks:

1. A `radiogroup` named "Plan" with `aria-required="true"`; four `radio` roles (the hidden inputs
   are not in the tree), none checked; "Team" is disabled.
2. Tab from the page start focuses "Free" (none is checked); Space checks it (`value: free`).
3. ArrowDown checks and focuses "Pro" (`value: pro`); ArrowDown again skips "Team" to
   "Enterprise"; ArrowDown wraps to "Free"; ArrowUp wraps back to "Enterprise"; ArrowRight goes to
   "Free", ArrowLeft back to "Enterprise". Each move leaves exactly one radio checked.
4. Tab leaves the group to "Submit"; Shift+Tab comes back to the checked "Enterprise".
5. A click on the label text "Pro" checks "Pro" and focuses it.
6. "Submit" with none checked (first page load) submits nothing (`form: none`) and focuses "Free";
   with "Pro" checked, it submits `form: plan=pro`.
7. "Reset" returns the group to no radio checked.
8. A click on "Team" (forced: it is disabled) does nothing.
9. Axe finds no violation.

### `/radio-group/basic?dir=rtl`

The same page right to left. Checks: focused on "Free" (checked with Space), ArrowLeft checks
"Pro", ArrowLeft again "Enterprise", ArrowRight "Pro"; ArrowDown "Enterprise" (unchanged keys).

### `/radio-group/controlled`

A RadioGroup labelled by a heading **"Size"**, `orientation="horizontal"`, `loopFocus` `false`,
whose `value` the fixture holds, starting at `"medium"`: radios **"Small"**, **"Medium"**,
**"Large"** (`small`, `medium`, `large`). The fixture refuses `"large"`: an
`onValueChange("large")` is recorded (`requested: large`) but `value` stays (spec/README.md, "A
controlled value the consumer rejects"). Output: `value: ...`, `requested: ...`.

Checks:

1. The `radiogroup` has `aria-orientation="horizontal"`; "Medium" is checked.
2. Focused on "Medium", ArrowLeft checks "Small" (`value: small`); ArrowLeft again does nothing
   (`loopFocus` `false`: "Small" stays checked and focused).
3. A click on "Large" reports `requested: large`; "Small" stays checked (`value: small`).

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Radio.Root is a `span` (`nativeButton` `false`), its Indicator not hidden from the accessibility tree | a `button` (labelable by `<label for>`), and an Indicator with `aria-hidden="true"`, as [Checkbox](checkbox.md) |
| Base UI's group always loops and has no `orientation` | `loopFocus` (`true`, the APG) and `orientation` (`aria-orientation` only), the Epic's scope; the keys stay the APG's |
| Base UI's values are any value | strings: the hidden input's value is the value itself |
| A form reset does not return Base UI's group to its default | **reset** (spec/README.md, "Forms"), as a native radio set |
