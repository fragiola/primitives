# Checkbox and CheckboxGroup

## Purpose

A two-state (or mixed) choice the user toggles (APG `checkbox`, including the mixed-state
pattern), and a group of checkboxes sharing one array value, with an optional parent checkbox that
checks or clears the whole group. It works in a native `<form>`: it submits, resets and validates
as an `<input type="checkbox">` would. A switch, a radio group and a tri-state cycle driven by the
user (unchecked → mixed → checked) are out of scope: `indeterminate` is set by the app, or by the
group for its parent.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Checkbox.Root | `button` | `checkbox-root` | the `checkbox`; holds its state |
| Checkbox.Indicator | `span` | `checkbox-indicator` | shows the check or the dash; rendered only while checked or indeterminate |
| (hidden input) | `input type="checkbox"` | `checkbox-input` | rendered by the Root right after its element; what the form submits |

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| CheckboxGroup | `div` | `checkbox-group-root` | the `group`; holds the array value |

The hidden input is visually hidden (`position: absolute`, 1 px, clipped), `aria-hidden="true"`
and `tabindex="-1"`, so it is never in the accessibility tree nor in the tab order (axe, screen
readers): the Root is the only `checkbox` users meet.

## API

**Checkbox.Root**:

- `checked`, `defaultChecked` (`false`), `onCheckedChange(checked, details)`.
- `indeterminate` (`false`): shows the mixed state; a toggle from it checks (`checked: true`) and
  the app (or the group) decides whether it stays mixed.
- `disabled`, `required`.
- `name`, `value` (`"on"`): the form submits `name=value` while checked, nothing while not (as a
  native checkbox).
- Inside a CheckboxGroup: `value` names the checkbox in the group's array; its checked state comes
  from the group. `parent` (`false`) makes it the group's parent checkbox.

**Checkbox.Indicator**: `keepMounted` (`false`): when `true`, it is rendered in every state.

**CheckboxGroup**: `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the checked
children's `value`s, in the order of `allValues`, else in the order they were checked;
`allValues`: every child value, which the parent checkbox checks; `disabled` (disables every
child).

**Inside a [Field](field.md)** (its integration contract): a Checkbox alone is the field's
control. A CheckboxGroup inside a `Field.Root` is the field's control instead: the Field's Label
names the group (`aria-labelledby`), its description and errors describe it
(`aria-describedby`), `aria-invalid` is on the group, the group carries the field's state
attributes, and `validate` receives the group's array. The group's Checkboxes take the field's
`name` (each submits its own `value`; a parent checkbox submits nothing) and `disabled`, and do
not register as the field's control themselves.

A change reports reason `none` (the vocabulary of spec/README.md has no reason a toggle could
explain better; Base UI does the same).

A form `reset` (the form's reset button, `form.reset()`) returns each uncontrolled checkbox and
group to its default; a controlled one reports the default through `on*Change` (reason `none`).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="checkbox"`, `type="button"`, `aria-checked` (`"true"`, `"false"`, `"mixed"`), `aria-required="true"` when required, `disabled` and `data-disabled` when disabled, `data-checked` / `data-unchecked` / `data-indeterminate` (exactly one), `data-required`; a parent checkbox also has `aria-controls` (its children's ids) |
| Indicator | `aria-hidden="true"`, the same `data-checked` / `data-unchecked` / `data-indeterminate`, `data-disabled` |
| hidden input | `type="checkbox"`, `name`, `value`, `checked`, `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden) |
| CheckboxGroup | `role="group"`, `data-disabled`; its accessible name comes from the consumer (`aria-labelledby`), or the Field's Label; inside a Field, `aria-describedby`, `aria-invalid` and the field's state attributes |

The Root's accessible name comes from the consumer: a `<label>` around it, `<label for>` (a
`button` is labelable), or `aria-label`.

## Keyboard

| key | action |
| --- | --- |
| Space | toggles |
| Enter | does nothing (APG: Space only; a native checkbox does not toggle on Enter either) |
| Tab | moves on; every checkbox is a tab stop |

## Focus

The Root is a native `button`: focusable unless disabled. When the form's validation fails on a
required checkbox, the browser's `invalid` event on the hidden input moves focus to the Root.

## Pointer

A click on the Root, or on its `<label>`, toggles. A disabled checkbox ignores both.

## Group and parent

- A child's checked state is `group.value.includes(child.value)`; toggling it adds or removes its
  value.
- The parent checkbox is checked when every value of `allValues` is checked, unchecked when none,
  and indeterminate otherwise. Toggling it from unchecked or indeterminate checks all, from checked
  clears all.
- The parent checkbox submits nothing (no `name` needed); each child submits its own `name=value`.

## Animation

None of its own; the Indicator can use `data-starting-style` / `data-ending-style` in a later
stage.

## RTL

Nothing changes (the consumer's layout follows `dir`).

## Scenarios

Every form scenario prints the submitted `FormData` in the output as `form: <key=value&...>`
(`none` before any submission), from the form's `submit` event (prevented, so the page stays).

### `/checkbox/basic`

A `<form>` with:

- a checkbox labelled **"Accept terms"** (a `<label>` around the Root and the text), `name="terms"`,
  `required`;
- a checkbox labelled **"Subscribe"**, `name="news"`, `value="yes"`, `defaultChecked`;
- a checkbox labelled **"Locked"**, `disabled`;
- buttons **"Submit"** (`type="submit"`) and **"Reset"** (`type="reset"`).

Output: `terms: <true|false>` (the last `onCheckedChange` of "Accept terms", `none` before any),
`form: ...`.

Checks:

1. Exactly three `checkbox` roles (the hidden inputs are not in the tree): "Accept terms"
   (`aria-checked="false"`, `aria-required="true"`), "Subscribe" (`"true"`), "Locked"
   (disabled).
2. A click on "Accept terms" checks it (`terms: true`); a click on its label text unchecks it.
3. Focused, Space toggles it; Enter does not.
4. "Submit" with "Accept terms" unchecked submits nothing (`form: none`, required) and focuses
   "Accept terms"; checked, it submits `form: terms=on&news=yes`.
5. "Reset" returns every checkbox to its default ("Accept terms" unchecked, "Subscribe" checked).
   The field scenario of the group is [`/field/more-controls`](field.md#fieldmore-controls).
6. A click on "Locked" does nothing.
7. Axe finds no violation.

### `/checkbox/group`

A `<form>` with a CheckboxGroup labelled by a heading **"Toppings"** (`aria-labelledby`),
`allValues` `cheese`, `ham`, `pineapple`, `defaultValue` `["cheese"]`: a parent checkbox
**"All toppings"**, then **"Cheese"**, **"Ham"**, **"Pineapple"** (each `name="toppings"` and its
value), and a **"Submit"** button. Output: `value: <comma-separated>` (`none` when empty),
`form: ...`.

Checks:

1. A `group` named "Toppings"; "All toppings" is `aria-checked="mixed"`, "Cheese" `"true"`.
2. A click on "All toppings" checks all (`value: cheese,ham,pineapple`, parent `"true"`); again
   clears all (`value: none`), parent `"false"`.
3. Checking "Ham" makes the parent mixed; checking "Cheese" and "Pineapple" too makes it `"true"`.
4. "Submit" with Cheese and Ham checked: `form: toppings=cheese&toppings=ham`.

### `/checkbox/controlled`

A checkbox labelled **"Keep me signed in"** whose `checked` the fixture holds, starting at `true`,
and which the fixture refuses to clear: an `onCheckedChange(false)` is recorded
(`requested: false`) but `checked` stays `true` (spec/README.md, "A controlled value the consumer
rejects"). Output: `checked: ...`, `requested: ...`.

Checks: a click reports `requested: false` and the checkbox stays `aria-checked="true"`
(`checked: true`); Space does the same.

## Differences from Base UI

Measured by the POC against Base UI 1.9 (`Checkbox`, `CheckboxGroup`):

| difference | decision |
| --- | --- |
| A form reset does not return Base UI's checkbox to its default (it keeps its state) | **reset** (spec/README.md, "Forms"): a native checkbox returns to its default, and the APG says nothing |
| Base UI's Root is a `span` with `role="checkbox"`, and its Indicator does not hide its content from the accessibility tree | a `button` (labelable by `<label for>`, focusable natively), and an Indicator with `aria-hidden="true"` |
