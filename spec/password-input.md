# PasswordInput

## Purpose

A password text field with a button that shows and hides what was typed: a sign-in form, a new
password, a recovery key. The Input is a native `<input>` whose `type` switches between
`password` and `text`; the VisibilityTrigger is a toggle button. It is a form control: the Input
carries the `name`, submits, resets and validates, alone or in a [Field](field.md).

It does not measure the password's strength (a strength meter is styled UI: a [Meter](meter.md)
or Fragiola UI), nor generate one, nor check it against rules (the app's `validate`).

**Scope: stage 4** (Epic #94, Issue #92). The APG has no password pattern and Base UI has no
PasswordInput: the behaviour references are Zag/Ark's PasswordInput and Radix's
PasswordToggleField (read, never copied). Where they differ, the APG-closest option is decided
here (D4) and recorded in `docs/decisions.md` ("Text inputs"):

- the **VisibilityTrigger is the APG's toggle button** (`aria-pressed`, a name that never
  changes: the app's "Show password"), with `aria-controls` naming the Input (Zag's
  `aria-expanded` and changing English label, Radix's changing label, are not taken: the APG says
  a toggle button's label stays the same while its state changes);
- **the Input keeps its value, its selection and the focus** when the visibility changes (the
  Issue): a pointer press on the trigger does not take the focus from the Input (its
  `mousedown`'s default is prevented, as NumberField's buttons), and the Input's selection is put back after its
  `type` changes; a keyboard press keeps the focus on the trigger (a button);
- **a form submission and a form reset hide the password** again (Radix's: a browser must not
  remember the field's text as plain text, and a reset returns every control to its default).

Out of scope: a strength meter, Zag's `ignorePasswordManagers` (the app adds the managers' own
attributes on the Input, which forwards them) and an Indicator part (the trigger's content follows
its state: `data-visible`, its render function, the recipe).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `password-input-root` | holds the value and the visibility |
| Input | `input` | `password-input-input` | `type="password"`, or `"text"` while visible; the form control and the labelled control |
| VisibilityTrigger | `button` | `password-input-visibility-trigger` | shows and hides the text; `type="button"` |

One entry, `/password-input` (D8), built on no other component; a Field control
(`ENTRY_DEPENDENCIES`: `field`). It uses the toolkit's `/form` (the form bridge) only.

## API

**Root**:

- `value`, `defaultValue` (`""`), `onValueChange(value, details)`: the text. Reasons:
  `input-change` (typing, a paste, autofill), `none` (a form reset).
- `visible`, `defaultVisible` (`false`), `onVisibleChange(visible, details)`: whether the text is
  shown. Reasons: `trigger-press` (the VisibilityTrigger), `none` (a form submission or reset).
- `disabled` (`false`): the Input and the VisibilityTrigger are disabled.
- `readOnly` (`false`): the Input is read-only; the VisibilityTrigger still shows and hides it
  (reading a read-only password is allowed).
- `required` (`false`): the Input is `required`.
- `name`: the Input's `name`.
- `id`: the Input's `id` (generated when not given), for a `<label for>` outside a Field.

**Input**: a native `input`; every attribute is forwarded (`autoComplete`, `minLength`,
`placeholder`, `inputMode`, a password manager's attributes). `autoComplete` is passed through as
given: `"current-password"` or `"new-password"` is the app's to choose. The Input sets
`autocapitalize="off"` and `spellcheck="false"` (a password is neither capitalized nor checked).

**VisibilityTrigger**: a native `button`; its content and its accessible name are the app's (an
eye icon with `aria-label="Show password"`).

Every part's `render` and `className` functions (Vue: the `render` slot; Angular: `state()`
through `exportAs`, `#password="passwordInputRoot"`) receive the state `{ value, visible,
disabled, readOnly, required }`.

**Inside a [Field](field.md)** (its integration contract): the Input is the labelable element
(`id`, `for`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, the field's states) and the
validated element; `validate` receives the text; the field's `name` and `disabled` win. Focus and
blur are the Input's. Focus target: the Input.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| every part | `data-visible` while visible, `data-disabled`, `data-readonly`, `data-required` |
| Root | inside a Field, the field's state attributes |
| Input | `type` (`"password"` or `"text"`), `id`, `name`, `disabled`, `readonly`, `required`, `autocapitalize="off"`, `spellcheck="false"`; inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes |
| VisibilityTrigger | `type="button"`, `aria-pressed` (`"true"` while visible, `"false"` while hidden), `aria-controls` (the Input's `id`), `disabled` |

The Input's accessible name is its label (a `<label for>`, the Field's Label, or the app's
`aria-label`). A password input has no ARIA role (`type="password"` maps to none); while visible
it is a `textbox`. The VisibilityTrigger's name is the app's and stays the same (APG toggle
button).

## Keyboard

| key | action |
| --- | --- |
| Tab | the Input, then the VisibilityTrigger (both in the tab order) |
| Enter, Space (on the VisibilityTrigger) | toggles the visibility (a native button); the focus stays on the trigger |
| Enter (in the Input) | the browser's: it submits the Input's form |

## Focus

Changing the visibility never moves the focus. A **pointer press** on the VisibilityTrigger
prevents its `mousedown`'s default (as TagsInput's ClearTrigger and NumberField's buttons), so the
focus stays where it was (the Input, typically: a touch keyboard stays open) and the trigger does
not take it; a keyboard or assistive-technology click is a plain button click (the trigger keeps
the focus it had). After the Input's `type` changes, its
`selectionStart`, `selectionEnd` and `selectionDirection` are put back as they were before the
change (a browser may move the caret to the end when the type changes), so the user goes on
typing where they were.

## Pointer

A click on the VisibilityTrigger toggles the visibility (reason `trigger-press`). While disabled,
it does nothing.

## Forms

The Input is the form control (no hidden input, as Autocomplete's): it carries `name`,
`required` and `disabled`, submits the text and is the element the browser validates. A form
**reset** returns an uncontrolled Root to its `defaultValue` (a controlled one reports it,
reason `none`) and hides the text (`onVisibleChange(false)`, reason `none`, when it was visible).
A form **submission** (the form's `submit` event, whether or not the app prevents its default)
hides the text too, before the browser reads the form, so a password manager sees a password
field. When the browser's validation finds the Input invalid, it focuses the Input itself.

## RTL

Nothing changes (the recipe places the trigger at the Input's inline end).

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios). Each
VisibilityTrigger holds an eye icon (`aria-hidden="true"`) and is named by `aria-label`.

### `/password-input/basic`

A `<form>` with a `<label for="password">` **"Password"**, a Root `id="password"`,
`name="password"`, an Input `autoComplete="current-password"`, a VisibilityTrigger
**"Show password"**; buttons **"Submit"** (`type="submit"`) and **"Reset"** (`type="reset"`).
Output: `value: ...` (the last `onValueChange`, `none` before any), `visible: ...` (the last
`onVisibleChange`, `none` before any), `reason: ...` (the last reason of either), `form: ...`.

Checks:

1. The Input, named "Password", has `type="password"`, `autocomplete="current-password"`,
   `autocapitalize="off"`, `spellcheck="false"`; the `button` "Show password" has
   `aria-pressed="false"` and `aria-controls` the Input's `id`.
2. Typing `hunter2` in the Input reports `value: hunter2`, `reason: input-change`.
3. With the Input's characters 1 to 4 selected, a mouse click on "Show password" makes the Input
   `type="text"` (a `textbox` named "Password"), the trigger `aria-pressed="true"`, reports
   `visible: true`, `reason: trigger-press`; the focus stays on the Input, its selection is still
   1 to 4 and its value `hunter2`. A second click hides it again (`type="password"`).
4. Tab from the Input focuses "Show password"; Space shows the text (`aria-pressed="true"`) and
   the focus stays on the trigger; Enter hides it.
5. With the text shown, "Submit" submits `form: password=hunter2` and hides the text
   (`visible: false`, `reason: none`, `type="password"`).
6. "Reset" empties the Input (`value: `, `reason: none`).
7. Axe finds no violation, hidden and shown.

### `/password-input/states`

A **"PIN"** Root (`<label for>`), `disabled`, `defaultValue="1234"`, with its trigger **"Show
PIN"**; a **"Recovery key"** Root, `readOnly`, `defaultVisible`, `defaultValue="abcd-efgh"`, with
its trigger **"Show recovery key"**. Output: `visible: ...`.

Checks:

1. "PIN" is disabled, `type="password"`; "Show PIN" is disabled; a click on it (forced) changes
   nothing (`visible: none`).
2. "Recovery key" is read-only, `type="text"`; "Show recovery key" has `aria-pressed="true"`; a
   click on it hides the key (`type="password"`, `visible: false`).
3. Tab from the page start focuses "Recovery key", then "Show recovery key" (the disabled ones
   are skipped).
4. The Roots, Inputs and triggers carry `data-disabled` ("PIN") and `data-readonly` ("Recovery
   key"), `data-visible` while visible.

### `/password-input/field`

A `<form>` with a `Field.Root`: a `Field.Label` **"New password"**, a Root `required`,
`name="new-password"`, an Input `autoComplete="new-password"` `minLength={8}`, its trigger
**"Show password"**, a `Field.Description` **"At least 8 characters."**, a `Field.Error`
**"Enter a password of 8 characters or more."**; buttons **"Submit"** and **"Reset"**. Output:
`form: ...`.

Checks:

1. The Input is named "New password", described by "At least 8 characters.", `required`, not
   `aria-invalid`.
2. "Submit" submits nothing (`form: none`), focuses the Input, makes it `aria-invalid="true"` and
   shows the error.
3. Typing `correct horse` hides the error once it is valid (the field's change rule) and
   "Submit" submits `form: new-password=correct horse`.
4. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no PasswordInput. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The trigger's ARIA | `aria-pressed` and `aria-controls`, the app's fixed name | the APG toggle button (its label does not change with the state); Zag's `aria-expanded` names no expandable region, and its English label is text (rule 7) |
| Focus on a press | the Input keeps it (a pointer), the trigger keeps it (keyboard) | the Issue; Zag's pointer down, Radix's restore; NumberField's buttons do the same |
| The selection | put back after the type changes | Radix's; a type change may move the caret |
| Submit and reset | both hide the text | Radix's (a browser must not save the text as plain text); a reset returns every control to its default |
| A read-only Root | the trigger still works | reading a read-only value is harmless (Zag disables it) |
| An Indicator part, `ignorePasswordManagers`, a strength meter | not offered | the trigger's state covers the icon; the Input forwards any attribute; a meter is styled UI |
