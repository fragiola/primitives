# Switch

## Purpose

An on/off control the user toggles (APG `switch`): a `switch` role whose state is on or off, never
mixed. It works in a native `<form>`: it submits, resets and validates as an
`<input type="checkbox">` would, and can submit a value while off (`uncheckedValue`). A switch
with a mixed state, or one that acts at once on something remote (the app decides), is out of
scope.

**Scope: stage 1** (Epic #29). The APG `switch` pattern decides the role and the keys; Base UI's
`Switch` (1.9) decides the parts, `uncheckedValue` and `readOnly` (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Switch.Root | `button` | `switch-root` | the `switch`; holds its state |
| Switch.Thumb | `span` | `switch-thumb` | the moving part; always rendered |
| (hidden input) | `input type="checkbox"` | `switch-input` | rendered by the Root right after its element; what the form submits while on |
| (unchecked input) | `input type="hidden"` | `switch-unchecked-input` | rendered right after the hidden input, only while off and with `uncheckedValue`; submits it |

The hidden input is visually hidden, `aria-hidden="true"` and `tabindex="-1"`, as a checkbox's;
the unchecked input is `type="hidden"`, which is never in the tree.

## API

**Switch.Root**:

- `checked`, `defaultChecked` (`false`), `onCheckedChange(checked, details)` (reason `none`).
- `disabled`, `required`, `readOnly` (`false`): a read-only switch is focusable and submits, but
  a press or a key does not toggle it.
- `name`, `value` (`"on"`): the form submits `name=value` while on.
- `uncheckedValue`: when given, the form submits `name=uncheckedValue` while off (Base UI);
  without it, nothing while off (as a native checkbox).
- `id`.

**Switch.Thumb**: no props.

**Inside a [Field](field.md)** (its integration contract), as a Checkbox: the Root is the
labelable element, `validate` receives `checked`, focus and blur come from the Root, and the
validated element is its hidden checkbox input (`required`: on).

A form `reset` returns an uncontrolled switch to its default; a controlled one reports the
default through `onCheckedChange` (reason `none`).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="switch"`, `type="button"`, `aria-checked` (`"true"` or `"false"`), `aria-required="true"` when required, `aria-readonly="true"` when read-only, `disabled` and `data-disabled` when disabled, `data-checked` / `data-unchecked` (exactly one), `data-readonly`, `data-required`; inside a Field, its attributes |
| Thumb | the same `data-checked` / `data-unchecked`, `data-disabled`, `data-readonly`, `data-required` |
| hidden input | `type="checkbox"`, `name`, `value`, `checked`, `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden) |
| unchecked input | `type="hidden"`, `name`, `value` (the `uncheckedValue`), `disabled` when disabled |

The Root's accessible name comes from the consumer: a `<label>` around it, `<label for>`, or
`aria-label`.

## Keyboard

| key | action |
| --- | --- |
| Space | toggles |
| Enter | toggles (the APG's optional key; Base UI does the same) |
| Tab | moves on; every switch is a tab stop |

A read-only switch ignores Space and Enter.

## Focus

The Root is a native `button`: focusable unless disabled. When the form's validation fails on a
required switch, the browser's `invalid` event on the hidden input moves focus to the Root.

## Pointer

A click on the Root, or on its `<label>`, toggles. A disabled or read-only switch ignores both.

## Animation

None of its own: the Thumb's position is the recipe's, from `data-checked`.

## RTL

Nothing changes (the recipe moves the Thumb with logical properties).

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios).

### `/switch/basic`

A `<form>` with switches, each a Switch.Root with its Thumb inside a `<label>` with its text:

- **"Wi-Fi"**, `name="wifi"`, `defaultChecked`;
- **"Bluetooth"**, `name="bluetooth"`, `value="yes"`, `uncheckedValue="no"`;
- **"Accept terms"**, `name="terms"`, `required`;
- **"Location"**, `name="location"`, `defaultChecked`, `readOnly`;
- **"Airplane mode"**, `disabled`;
- buttons **"Submit"** (`type="submit"`) and **"Reset"** (`type="reset"`).

Output: `wifi: <true|false>` (the last `onCheckedChange` of "Wi-Fi", `none` before any),
`form: ...`.

Checks:

1. Exactly five `switch` roles: "Wi-Fi" `aria-checked="true"`, "Bluetooth" `"false"`, "Accept
   terms" `aria-required="true"`, "Location" `aria-readonly="true"`, "Airplane mode" disabled.
2. A click on "Wi-Fi" turns it off (`wifi: false`); a click on its label text turns it on again.
3. Focused, Space toggles it, and Enter toggles it again.
4. "Submit" with "Accept terms" off submits nothing (`form: none`) and focuses "Accept terms".
   With it on: `form: wifi=on&bluetooth=no&terms=on&location=on`; with "Bluetooth" on too:
   `form: wifi=on&bluetooth=yes&terms=on&location=on`.
5. "Location": a click, Space and Enter leave it on.
6. "Reset" returns every switch to its default ("Wi-Fi" on, "Bluetooth" and "Accept terms" off).
7. A click on "Airplane mode" (forced) does nothing.
8. Axe finds no violation.

### `/switch/controlled`

A switch labelled **"Dark mode"** whose `checked` the fixture holds, starting at `true`, and
which the fixture refuses to turn off: an `onCheckedChange(false)` is recorded
(`requested: false`) but `checked` stays `true`. Output: `checked: ...`, `requested: ...`.

Checks: a click reports `requested: false` and the switch stays `aria-checked="true"`
(`checked: true`); Space does the same.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Root is a `span` (`nativeButton` `false`) | a `button` (labelable by `<label for>`), as [Checkbox](checkbox.md) |
| A form reset does not return Base UI's switch to its default | **reset** (spec/README.md, "Forms") |
