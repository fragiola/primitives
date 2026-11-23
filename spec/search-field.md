# SearchField

## Purpose

A text field for a search query, with a button that clears it: a site search, a filter box. The
Input is a native `<input type="search">` (the `searchbox` role); Escape clears it, Enter submits
the query. It is a form control: the Input carries the `name`, submits, resets and validates,
alone or in a [Field](field.md).

It does not suggest anything: a search with suggestions is an [Autocomplete](autocomplete.md) or
a [Combobox](combobox.md). It does not filter anything itself: the app reads the value.

**Scope: stage 4** (Epic #94, Issue #92). The APG has no search field pattern (its `searchbox`
role is a textbox for search, its `search` landmark the form around it) and Base UI has no
SearchField: the behaviour reference is React Aria's SearchField (read, never copied). Where the
APG says nothing, the APG-closest option is decided here (D4) and recorded in
`docs/decisions.md` ("Text inputs"):

- the **ClearButton is not in the tab order** (`tabindex="-1"`), as React Aria's: Escape clears
  the field from the keyboard, and a tab stop that only empties the field would sit between the
  query and the page's next control;
- **Escape clears a non-empty field and is then left to the page**: on an empty field the
  component does not handle it (its default is not prevented, the event goes on), so a second
  Escape reaches a dialog or a popup around the field;
- **Enter calls `onSubmit(value)`** and the browser goes on with the form's implicit submission,
  as React Aria's (a search form submits on Enter).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `search-field-root` | holds the value |
| Input | `input` | `search-field-input` | `type="search"`; the form control and the labelled control |
| ClearButton | `button` | `search-field-clear-button` | empties the field; `type="button"`, `tabindex="-1"` |

One entry, `/search-field` (D8), built on no other component; a Field control
(`ENTRY_DEPENDENCIES`: `field`). It uses the toolkit's `/form` (the form bridge) only.

## API

**Root**:

- `value`, `defaultValue` (`""`), `onValueChange(value, details)`: the query. Reasons:
  `input-change` (typing, a paste), `escape-key` (Escape cleared it), `clear-press` (the
  ClearButton), `none` (a form reset).
- `onSubmit(value)`: Enter in the Input, with the current value (also while it is empty); not
  called while disabled or read-only.
- `disabled` (`false`): the Input and the ClearButton are disabled.
- `readOnly` (`false`): the Input is read-only; Escape and the ClearButton do not clear it.
- `required` (`false`): the Input is `required`.
- `name`: the Input's `name`.
- `id`: the Input's `id` (generated when not given), for a `<label for>` outside a Field.

**Input**: a native `input`; every attribute is forwarded (`placeholder`, `autoComplete`,
`enterKeyHint`, `inputMode`).

**ClearButton**: a native `button`; its content and its name are the app's (an icon with
`aria-label="Clear search"`). It stays rendered while the field is empty (`data-empty`, which a
recipe hides it with).

Every part's `render` and `className` functions (Vue: the `render` slot; Angular: `state()`
through `exportAs`, `#search="searchFieldRoot"`) receive the state `{ value, empty, disabled,
readOnly, required }`.

**Inside a [Field](field.md)** (its integration contract): the Input is the labelable element
(`id`, `for`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, the field's states) and the
validated element; `validate` receives the query; the field's `name` and `disabled` win. Focus
and blur are the Input's. Focus target: the Input.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| every part | `data-empty` while the value is `""`, `data-disabled`, `data-readonly`, `data-required` |
| Root | inside a Field, the field's state attributes |
| Input | `type="search"`, `id`, `name`, `disabled`, `readonly`, `required`; inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes |
| ClearButton | `type="button"`, `tabindex="-1"`, `aria-controls` (the Input's `id`), `disabled` while the Root is disabled or read-only |

The Input is a `searchbox` (its native role), named by its label (a `<label for>`, the Field's
Label, or the app's `aria-label`). A `search` landmark is the app's (a `<search>` element, or
`role="search"`, around the field's form).

## Keyboard

| key | action |
| --- | --- |
| Escape | with a value: clears it (reason `escape-key`), its default prevented (a native search input would clear it again, and a dialog around it must not close); empty, disabled or read-only: not handled, its default not prevented and the event goes on to the page |
| Enter | calls `onSubmit(value)`; the browser then submits the Input's form, as it does for any text input |
| Tab | the Input is a tab stop; the ClearButton is not |

## Focus

A press on the ClearButton clears the field and focuses the Input (React Aria's), and its pointer
down's default is prevented, so the focus does not pass through the button. Escape keeps the
focus in the Input.

## Pointer

A click on the ClearButton empties the field (reason `clear-press`) and focuses the Input; while
the field is empty it reports nothing. While disabled or read-only, it does nothing.

## Forms

The Input is the form control (no hidden input, as Autocomplete's): it carries `name`,
`required` and `disabled`, submits the query and is the element the browser validates. A form
reset returns an uncontrolled Root to its `defaultValue` (a controlled one reports it, reason
`none`). When the browser's validation finds the Input invalid, it focuses the Input itself.

## RTL

Nothing changes (the recipe places the ClearButton at the Input's inline end).

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios). Each
ClearButton holds a cross icon (`aria-hidden="true"`) and is named by `aria-label`. The recipe
hides the browser's own cancel button (`::-webkit-search-cancel-button`) and an empty field's
ClearButton (`data-empty`).

### `/search-field/basic`

A `<search aria-label="Products">` holding a `<form>` with a `<label for="search">` **"Search"**, a Root
`id="search"`, `name="q"`, an Input `placeholder="Lamps, desks…"`, a ClearButton **"Clear
search"**, and a button **"Go"** (`type="submit"`). The page counts the Escape key downs that
reach the document with their default not prevented. Output: `value: ...` (the last
`onValueChange`, `none` before any), `reason: ...`, `submitted: ...` (the last `onSubmit`, `none`
before any), `page-escape: <count>`, `form: ...`.

Checks:

1. A `search` landmark "Products" holds a `searchbox` named "Search" and the `button` "Clear
   search", which has `tabindex="-1"` and `aria-controls` the Input's `id`; the Root, the Input
   and the ClearButton have `data-empty`.
2. Typing `lamp` reports `value: lamp`, `reason: input-change`; `data-empty` is gone.
3. Escape empties the field (`value: `, `reason: escape-key`), the focus stays in it and
   `page-escape: 0`; a second Escape changes nothing and reaches the page (`page-escape: 1`).
4. Typing `desk` and pressing Enter reports `submitted: desk` and submits `form: q=desk`.
5. Tab from the page start focuses the searchbox, then "Go" (the ClearButton is skipped).
6. With `desk` typed, a click on "Clear search" empties the field (`reason: clear-press`) and
   focuses the searchbox.
7. Axe finds no violation, empty and with a query.

### `/search-field/states`

A **"Disabled search"** Root (`<label for>`), `disabled`, `defaultValue="chairs"`; a **"Saved
search"** Root, `readOnly`, `defaultValue="tables"`; each with a ClearButton (**"Clear disabled
search"**, **"Clear saved search"**). Output: `value: ...`.

Checks:

1. "Disabled search" is disabled and its ClearButton disabled.
2. "Saved search" is read-only; its ClearButton is disabled; Escape in it changes nothing
   (`value: none`) and the field keeps `tables`.
3. Every part carries `data-disabled` ("Disabled search") or `data-readonly` ("Saved search");
   neither Root has `data-empty`.

### `/search-field/field`

A `<form>` with a `Field.Root`: a `Field.Label` **"City"**, a Root `required`, `name="city"`, an
Input, a ClearButton **"Clear city"**, a `Field.Description` **"Where to look."**, a `Field.Error`
**"Enter a city."**; buttons **"Submit"** and **"Reset"**. Output: `form: ...`.

Checks:

1. The `searchbox` is named "City", described by "Where to look.", `required`, not
   `aria-invalid`.
2. "Submit" submits nothing (`form: none`), focuses the searchbox, makes it `aria-invalid="true"`
   and shows "Enter a city.".
3. Typing `Lima` hides the error; "Submit" submits `form: city=Lima`.
4. "Reset" empties it; "Submit" submits nothing again.
5. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no SearchField. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The ClearButton's tab stop | none (`tabindex="-1"`) | React Aria's; Escape clears from the keyboard, and the button would sit between the query and the next control |
| Escape on an empty field | not handled, left to the page | React Aria's; a dialog or popup around the field closes on the next Escape |
| Enter | `onSubmit(value)`, then the browser's implicit submission | React Aria's; a search form submits on Enter |
| A read-only field | Escape and the ClearButton do not clear it | read-only means the value does not change (React Aria's) |
| `onClear`, `isInvalid`, `validationBehavior` | not offered | the change reason says why the value emptied; the Field layer validates |
