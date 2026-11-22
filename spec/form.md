# Form

## Purpose

A native `<form>` that runs the [Field](field.md) layer's validation itself: its submission
validates every field, shows their errors, focuses the first invalid field and is blocked while
one is invalid; it shows server errors on the fields they name, and gives its fields a default
`validationMode`. The APG has no form pattern; Base UI's `Form` (1.9) is the model (D4).

Controls the browser cannot validate (a Slider, a CheckboxGroup) block a Form's submission through
their field's `validate`, which a plain `<form>` cannot do. Out of scope: Base UI's `onFormSubmit`
(the values as an object) and `actionsRef`: the consumer reads the native `submit` event and its
`FormData`.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Form | `form` | `form-root` | `novalidate`: the Form validates, not the browser |

## API

**Form** (one component, not a namespace, as CheckboxGroup):

- `errors`: server errors, `{ [fieldName]: string | string[] }`, keyed by the Fields' `name`
  ([field.md](field.md#validation), "Server errors"). The Form keeps its own copy: a new `errors`
  object replaces it.
- `onClearErrors(errors)`: called when a field's value changes while the Form has errors for it,
  with the errors left (the field's key removed). A field's errors are hidden at once, whether or
  not the consumer passes the new object back.
- `validationMode` (`"onSubmit"`): the default of every Field inside it; a Field's own wins.
- The native `submit` event (`onSubmit` in React, `@submit` in Vue, `(submit)` in Angular)
  reaches the consumer only when the submission goes on: a submission blocked by an invalid
  field never reaches it.

Every native form attribute is forwarded (`action`, `method`, ...).

**A submission** (the `submit` event: a submit button, Enter in a text field, `requestSubmit()`):

1. Every Field inside the Form validates as on a submission attempt ([field.md](field.md),
   "When the result is shown"): its errors are shown and, in `onSubmit` mode, it validates on
   every change from then on.
2. When a field is invalid (its validity is `false`, `invalid` is set, or the Form has errors for
   it), the submission is blocked (`preventDefault`, and `stopImmediatePropagation` in the
   event's capture phase on the form, so no listener of the consumer runs) and focus moves to
   the **first invalid field** in document order: its control's focus target (a text input's text
   is selected).
3. Otherwise the submission goes on: the consumer's `submit` listener runs (it may still call
   `preventDefault` and submit with `fetch`).

**Server errors after a submission.** When `errors` changes after a submission went on (the
server answered), focus moves to the first invalid field, as for a blocked submission.

A form reset does not clear the Form's errors nor the fields' states (Base UI).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Form | `novalidate` |

The Form adds no role: a `form` has one only with an accessible name, which the consumer gives
(`aria-label`, `aria-labelledby`).

## Keyboard

Nothing of its own (Enter in a text field submits, natively).

## Focus

A blocked submission, and server errors that arrive after one went on, focus the first invalid
field's control.

## Pointer

Nothing of its own.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/form/basic`

A Form (`aria-label` **"Sign up"**), `validationMode="onBlur"`, with:

- a field `name="email"`: Label **"Email"**; a Control `type="email"`, `required`; an Error
  `match="valueMissing"` **"Enter your email."**; an Error `match="customError"` with no children.
  Its `validate` returns **"Use your work email."** for an address that does not end in
  `@example.com`.
- a field `name="username"`: Label **"Username"**; a Control; an Error with no children.
- a **"Submit"** button.

The fixture plays the server: a submission that goes on prints its entries (`form: ...`), and,
when the username is `admin`, answers `errors` `{ username: "This username is taken." }` a task
later. `onClearErrors` prints the keys left (`cleared: <keys>`, `empty` for none). Output:
`form: ...`, `cleared: ...`.

Checks:

1. A `form` named "Sign up" with `novalidate`; no error is shown.
2. **The Form's `validationMode`.** Typing `ada@gmail.com` in "Email" shows nothing; leaving it
   (Tab) shows "Use your work email." (`onBlur`, from the Form).
3. **A blocked submission.** Clearing "Email", then "Submit": nothing is submitted
   (`form: none`), "Enter your email." is shown, focus is on "Email" (the first invalid field).
4. **Server errors.** Typing `ada@example.com` in "Email" and `admin` in "Username", then
   "Submit": `form: email=ada@example.com&username=admin`. The server's answer makes "Username"
   `aria-invalid="true"`, shows "This username is taken." (its description), and focuses
   "Username".
5. **A blocked submission by a server error.** "Submit" again submits nothing new (the output
   keeps the last submission's line) and focus stays on "Username".
6. **Clearing.** Typing `s` in "Username" hides the server error, removes `aria-invalid` and
   prints `cleared: empty`. "Submit" gives `form: email=ada@example.com&username=admins`.
7. Axe finds no violation, before and after the server's answer.
8. Contract layer: the Form is a `FORM` with `form-root` and `novalidate`; the invalid
   Username's field parts carry `data-invalid` while the server error is shown.
9. **A form reset.** With the server error shown, `form.reset()` keeps "This username is taken."
   shown and "Username" `aria-invalid="true"`, and prints no `cleared:` line: a reset does not
   clear the Form's errors.

## Differences from Base UI

- **`onClearErrors`** reports the errors left when a field clears its own (Base UI 1.9 clears its
  copy silently): an app holding `errors` in its state can follow.
- **No `onFormSubmit`, no `actionsRef`** (out of scope, above).
