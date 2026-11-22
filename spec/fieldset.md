# Fieldset

## Purpose

Groups related [fields](field.md) under a shared legend, and disables them together: a native
`<fieldset>` whose legend names the group. Nested fieldsets inherit a parent's `disabled`. The APG
has no fieldset pattern (a `group` with a name); Base UI's `Fieldset` (1.9) is the model (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Fieldset.Root | `fieldset` | `fieldset-root` | a `group`, named by its Legend |
| Fieldset.Legend | `div` | `fieldset-legend` | names the Root (`aria-labelledby`) |

The Legend is a `div`, not a `<legend>` (Base UI): a native `<legend>` sits on the fieldset's
border and resists styling; the name comes from `aria-labelledby` instead.

## API

**Fieldset.Root**: `disabled` (`false`): disables the native fieldset (and so every native control
inside it) and every [Field](field.md) inside it. A Fieldset inside a disabled Fieldset is
disabled too.

**Fieldset.Legend**: `id` (generated unless the consumer gives one). Its children are its text.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `aria-labelledby` (the Legend's `id`, while a Legend is rendered), `disabled` and `data-disabled` while disabled |
| Legend | `id`, `data-disabled` while the Root is disabled |

A Field inside a disabled Fieldset carries `data-disabled` on its parts and its control, as a
disabled Field does.

## Keyboard

Nothing of its own.

## Focus

Nothing of its own: a disabled fieldset's controls are not focusable.

## Pointer

Nothing of its own.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/fieldset/basic`

A `<form>` with:

- a Fieldset, Legend **"Shipping address"**: a field `name="street"` (Label **"Street"**, a
  Control) and a field `name="city"` (Label **"City"**, a Control);
- a Fieldset `disabled`, Legend **"Billing address"**: a field `name="billing-street"` (Label
  **"Billing street"**, a Control), and a nested Fieldset, Legend **"Billing contact"**, with a
  field `name="phone"` (Label **"Phone"**, a Control);
- a **"Submit"** button.

Output: `form: ...` (as [checkbox.md](checkbox.md#scenarios)).

Checks:

1. A `group` named "Shipping address" holding the textboxes "Street" and "City", enabled.
2. A `group` named "Billing address" and a `group` named "Billing contact"; the textboxes
   "Billing street" and "Phone" are disabled.
3. Typing `Main St` in "Street" and `Lisbon` in "City", then "Submit", gives
   `form: street=Main St&city=Lisbon` (the disabled fields submit nothing).
4. Axe finds no violation.
5. Contract layer: the Roots are `FIELDSET` elements with `fieldset-root`, each `aria-labelledby`
   its Legend's `id`; the Legends are `DIV`s with `fieldset-legend`; the disabled Root, its Legend,
   the nested Root and its Legend carry `data-disabled`, the first Fieldset's parts none; every part
   of the fields inside the disabled Fieldset carries `data-disabled`.

## Differences from Base UI

None measured: the Root and the Legend follow Base UI 1.9 (`Fieldset`), including the nested
`disabled`.
