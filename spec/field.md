# Field

## Purpose

The layer that turns a form control into a labelled, described and validated field: a label linked
to the control, a description, error messages shown when the value is invalid, and the field's
interaction states (`dirty`, `touched`, `filled`, `focused`) for styling. It wraps a native input
(`Field.Control`) or one of the library's form controls: Checkbox, CheckboxGroup, Switch,
RadioGroup, Select, Slider, Combobox, DatePicker and DateRangePicker (the
[integration contract](#integration-contract)).
[Fieldset](fieldset.md) groups fields under a legend and disables them together; [Form](form.md)
adds server errors, the submission that shows every error and focuses the first invalid field,
and a `validationMode` for all its fields.

**Scope: production** (stage 1, Epic #26, "Field first"): the POC's Field (ported in Epic #9) with
async `validate`, `Error`'s `match` as a function, `Fieldset` and `Form`, and every form control
integrated. The APG has no field pattern; Base UI's `Field` (1.9) is the model (D4). Out of
scope: Base UI's `Field.Item`, `Field.Validity`, `validationDebounceTime`, `actionsRef`, the
controlled `dirty` / `touched` props, and the Error's enter and exit animations.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Field.Root | `div` | `field-root` | holds the field's state; renders no role |
| Field.Label | `label` | `field-label` | names the control |
| Field.Control | `input` | `field-control` | a native input; or one of the integrated controls instead |
| Field.Description | `p` | `field-description` | describes the control |
| Field.Error | `div` | `field-error` | rendered only while it is shown |

A field has one control: a `Field.Control`, a `Checkbox.Root`, a `CheckboxGroup`, a
`Switch.Root`, a `RadioGroup`, a `Select.Root`, a `Slider.Root`, a `Combobox.Root`, a `DatePicker.Root` or a
`DateRangePicker.Root`.

## API

**Field.Root**:

- `name`: the control's form name. It wins over the control's own `name`, and keys the field's
  server errors in a [Form](form.md) (`errors`).
- `disabled` (`false`): disables the control; no error is shown. A disabled
  [Fieldset](fieldset.md) around the field disables it too.
- `invalid` (`false`): forces the invalid state, for an error the app found (a server answer).
- `validate(value)`: returns a message, a list of messages, or `null` (or `undefined`) for none;
  or a promise of one of these ([async validation](#async-validation)). The value is the
  control's: the input's text, a checkbox's or a switch's `checked`, a group's array of values,
  a radio group's value (or `null`), a select's value
  (or `null`), a slider's number (or numbers), a picker's date or range (or `null`).
- `validationMode`: when the field validates and shows the result, see [Validation](#validation):
  `"onSubmit"`, `"onBlur"` or `"onChange"`. Default: the enclosing [Form](form.md)'s
  `validationMode`, else `"onSubmit"`.

**Field.Label**, **Field.Description**: no props of their own. Their `id` is generated unless the
consumer gives one.

**Field.Control**: `value`, `defaultValue` (`""`), `onValueChange(value, details)` (reason
`none`); `id`, `disabled` and every native input attribute (`type`, `required`, `minlength`,
`pattern`, ...), which it forwards.

**Field.Error**: `match`. Without it, the error is shown while the field is invalid. With a
`ValidityState` key (`"valueMissing"`, `"typeMismatch"`, `"patternMismatch"`, ..., and
`"customError"` for the messages of `validate`), it is shown while that key is set. With a
function `(validity) => boolean`, it is shown while the function returns `true`; it receives the
field's validity (every key, and `valid`: `null` before the first validation). With `true`, it
is always shown: the app decides when to render it. Its children are its text. With no children,
it shows the current messages: one as text, several as a `ul` with one `li` each. These are the
field's server errors ([Form](form.md) `errors`) when it has some, else the messages of
`validate`, else the browser's `validationMessage`. Server errors are shown by an Error with no
`match` (or `match={true}`) only: a key or a function matches the validity, which server errors
are not part of (Base UI).

The Root holds the state. The other parts read it, and every one of them carries its attributes.

## Validation

The field keeps a **validity**: the control's native `ValidityState` (from the element the form
validates: the Control, or the integrated control's hidden input), plus `customError` when
`validate` returns a message. Its `valid` is `null` until the field first validates, then `true`
or `false`.

**Validating** reads the native validity, then:

- **The required rule.** A `valueMissing` with no other native error counts as valid until the
  value has changed once, or a submission was attempted. So focusing and leaving an empty required
  field shows nothing.
- **`validate`** runs when the native validity has no error, or when the field validates on every
  change. Its messages make the field invalid (`customError`). They are also set as the custom
  validity of the validated element, so a native submission is blocked by them.
- **The messages** are `validate`'s, else the browser's `validationMessage`.

**The custom validity is always current.** The field runs `validate` on mount and on every change.
It sets the element's custom validity each time, whatever the mode, so a native form never submits
a value `validate` rejects. The mode decides only when the result is **shown**.

### Async validation

When `validate` returns a promise (a thenable), the field validates in two steps:

1. **At once**, the native validity alone. When it has an error (other than the required rule's
   `valueMissing`, which still counts as valid until the value changed), that error is the result,
   as with a synchronous `validate`, and the promise is not awaited.
2. **When the promise resolves**, its messages, as a synchronous `validate`'s: they are set as the
   validated element's custom validity and make the field invalid (`customError`). A rejected
   promise counts as no message.

While the latest run is pending, the field keeps what it showed: no new error, and none cleared
by that run. A change that hides a shown error (a field that does not validate on every change,
"When the result is shown") hides it at once, before its run settles (Epic #49): the rule is the
change's, not the run's. When it resolves, the result is shown if the run's event shows results (the table
below): a run started by a change in `onChange` mode, by a blur in `onBlur` mode, or by a
submission attempt.

**Latest wins.** Every validation (a change, a blur, a submission attempt) starts a new run. A run
that resolves after a newer run started is dropped, even when it resolves last: a slow answer for
an old value never replaces the answer for the current one.

**A value already validated is not validated again.** When the value is the one the last
resolved run validated, the field reuses that run's messages at once instead of calling
`validate` (so a submission attempt with an unchanged value is blocked by the custom validity
that run set, and a Form finds the field invalid). A submission does not wait for a pending
run (Base UI): the native submission or the Form goes on with the custom validity of the last
resolved run.

### When the result is shown



| event | `onSubmit` (default) | `onBlur` | `onChange` |
| --- | --- | --- | --- |
| a submission is attempted | shown | shown | shown |
| the control loses focus | no | shown | no |
| the value changes | no, until a submission was attempted; then shown | see below | shown |

**A submission attempt** is the browser's validation of the control's form. This is its
`invalid` event on any of the form's controls (the submission is blocked), or its `submit` event.
Every field of the form validates then. Inside a [Form](form.md) (`noValidate`), the Form's
submission validates every field. After a submission was attempted, an `onSubmit` field
validates on every change.

**A change on a field that shows an error, when the field does not validate on every change**
(`onBlur`, or `onSubmit` before a submission), hides the error: the field is valid until it next
validates. There is one exception. When the change leaves the value missing (a required field
emptied), the field validates at once, and the required error shows.

When validation blocks a submission, the browser focuses the first invalid control, or the
integrated control's primitive (spec/README.md, "Forms"); a [Form](form.md) focuses the first
invalid field's control.

**Server errors.** Inside a [Form](form.md), the field's `name` keys its `errors`. While the Form
has errors for it (a non-empty message or list), the field is invalid (`data-invalid`,
`aria-invalid`) and its Error with no `match` shows them. The first change of the field's value
clears them: the field asks the Form to drop its key ([form.md](form.md#api), `onClearErrors`).

## State attributes and ARIA

Every part, and the integrated control's main element (Checkbox.Root, Switch.Root, RadioGroup,
Select.Trigger, Slider.Root, Combobox.Input), carries:

| attribute | when |
| --- | --- |
| `data-invalid` | the field shows an error: its validity is `false`, `invalid` is set, or its Form has errors for it |
| `data-valid` | the field validated and is valid |
| `data-dirty` | the value differs from the value at mount |
| `data-touched` | the control has lost focus once |
| `data-filled` | the value is not empty: some text, a checked checkbox, a chosen option. A slider is always filled |
| `data-focused` | the control has focus (a slider: one of its thumbs) |
| `data-disabled` | the field is disabled (`disabled`, or a disabled Fieldset around it) |

Before the first validation, neither `data-invalid` nor `data-valid` is present. A disabled field
has neither.

| part | ARIA |
| --- | --- |
| Label | `id`; `for` the control's `id` when the control is labelable (the Control, Checkbox.Root's `button`, Switch.Root's `button`, Select.Trigger's `button`, Combobox.Input) |
| Control | `id` (generated, or the consumer's), `name` (the field's), `aria-labelledby` (the label), `aria-describedby`, `aria-invalid="true"` while invalid, `disabled` |
| Description | `id` |
| Error | `id` |

**`aria-describedby`** lists the description's `id` and the `id` of each shown error, in document
order. It is absent when the list is empty.

**`aria-invalid="true"`** is set while the field is invalid and not disabled. It is absent
otherwise.

## Integration contract

A control inside a `Field.Root` reads the field from its context. It must:

1. **Take the field's ids.** It uses the field's control `id` on its labelable element (unless the
   consumer gives one). It sets `aria-labelledby` to the label's `id`, and `aria-describedby` and
   `aria-invalid` as for the Control.
2. **Take the field's `name` and `disabled`.** The field's `name` wins over the control's.
   `disabled` on either disables it.
3. **Report its interaction:** focus and blur (`focused`, `touched`), and each change of its value
   (`dirty`, `filled`, and the change for [validation](#validation)).
4. **Expose the element the form validates:** its hidden input (or the Control's input). The field
   reads that element's native validity and sets its custom validity.
5. **Expose its focus target:** the element a [Form](form.md) focuses when the field is the first
   invalid one (the table's "focus and blur from" element; a Slider's first Thumb, a group's first
   enabled Checkbox).
6. **Carry the field's state attributes** on its main element.

Outside a `Field.Root`, a control behaves exactly as without the layer.

| control | labelable element (`id`, `for`) | `aria-labelledby`, `aria-describedby`, `aria-invalid` on | value given to `validate` | focus and blur from | validated element |
| --- | --- | --- | --- | --- | --- |
| Field.Control | the `input` | the `input` | its text | the `input` | the `input` |
| Checkbox | Checkbox.Root (`button`) | Checkbox.Root | `checked` | Checkbox.Root | its hidden `checkbox` input |
| Switch | Switch.Root (`button`) | Switch.Root | `checked` | Switch.Root | its hidden `checkbox` input |
| RadioGroup | none (a `radiogroup`) | the RadioGroup | the value, or `null` | its Radios (focus within the group; `touched` once focus leaves it) | its first enabled Radio's hidden `radio` input (radios of one name share their validity). Its Radios take the field's `name` and `disabled`, and do not register as the field's control themselves |
| Select | Select.Trigger (`button`) | Select.Trigger | the value, or `null` | Select.Trigger | its hidden input |
| Combobox | Combobox.Input (`input`) | Combobox.Input | the value: an item or `null`, or the list of items with `multiple` | Combobox.Input | its visually hidden input (combobox.md, "Forms") |
| Autocomplete | Autocomplete.Input (`input`) | Autocomplete.Input | the value, the text | Autocomplete.Input | the Input itself (autocomplete.md, "Forms") |
| Listbox | none (a `listbox`) | Listbox.Root | the value, or `null`, or the values with `multiple` | its options (focus within the list; `touched` once focus leaves it) | its visually hidden input ([listbox.md](listbox.md#forms)) |
| Slider | none (a `group`) | Slider.Root gets `aria-labelledby`. Each Thumb gets `aria-describedby` and `aria-invalid`, and `aria-labelledby` when it has no `aria-label` or `aria-labelledby` of its own | the value (a number, or numbers) | its Thumbs | none: its inputs are `type="hidden"`, which the browser never validates. `validate` still runs and shows its messages, but it cannot block a native submission (a [Form](form.md) blocks it) |
| CheckboxGroup | none (a `group`) | the CheckboxGroup | the array of checked values | its Checkboxes (focus within the group; `touched` once focus leaves it) | none: `validate` decides, as for the Slider. Its Checkboxes take the field's `name` (each still submits its own `value`; a parent checkbox submits nothing) and `disabled`, and do not register as the field's control themselves |
| DatePicker | DatePicker.Trigger (`button`) | DatePicker.Trigger; its `aria-labelledby` lists the label's `id` **then its own** (see below) | the date, or `null` | DatePicker.Trigger | its visually hidden input ([calendar.md](calendar.md#forms)) |
| DateRangePicker | DateRangePicker.Trigger (`button`) | DateRangePicker.Trigger, as DatePicker's | the range `{ start, end }`, or `null` | DateRangePicker.Trigger | its visually hidden input ([calendar.md](calendar.md#forms)) |
| NumberField | NumberField.Input (`input`) | NumberField.Input | the value, a number or `null` | NumberField.Input | its hidden `number` input ([number-field.md](number-field.md#forms)) |
| DateField, TimeField | none (a `group`; a press on the label focuses the first segment) | the Input (`group`) gets `aria-labelledby` and `aria-describedby`; every segment `aria-labelledby` (the label, then itself) and `aria-invalid` | the value, or `null` | its segments (focus within the Input; `touched` once focus leaves it) | its visually hidden `date`, `datetime-local` or `time` input ([date-field.md](date-field.md#forms)) |
| OTPField | its first slot (`input`) | the Root (`group`) gets `aria-labelledby` and `aria-describedby`; every slot `aria-invalid`, and `aria-labelledby` when it has no name of its own | the value, a string | its slots (focus within the group; `touched` once focus leaves it) | its visually hidden input ([otp-field.md](otp-field.md#forms)) |
| TagGroup | none (a `grid`) | TagGroup.List | the selected values (an array) | its Tags (focus within the List; `touched` once focus leaves it) | none: it has no hidden input ([tag-group.md](tag-group.md#forms)) |
| TagsInput | TagsInput.Input (`input`) | TagsInput.Input | the tags (an array of strings) | its Root (the Input, the tags and its buttons; `touched` once focus leaves it) | its visually hidden input ([tags-input.md](tags-input.md#forms)) |
| SegmentedControl | none (a `radiogroup`) | SegmentedControl.Root | the value, or `null` | its Items (focus within the Root; `touched` once focus leaves it) | its visually hidden input ([segmented-control.md](segmented-control.md#forms)) |
| Rating | none (a `radiogroup`) | Rating.Root | the value, a number (`0` for none) | its stars (focus within the Root; `touched` once focus leaves it) | its HiddenInput, when rendered ([rating.md](rating.md#forms)) |

**A picker's Trigger is named by its own content too.** Its text is the consumer's (the chosen
date), so `aria-labelledby` lists the label, then the Trigger itself: the name reads "Arrival
2026-11-24", and the visible text stays in it (WCAG 2.5.3, axe `label-content-name-mismatch`). A
Select's Trigger needs no such thing: it is a `combobox`, named by its label alone.

Select's and the pickers' popups are portalled. Their parts never need the field: the trigger and
the hidden input carry everything, and both stay inside the Root.

## Keyboard

Nothing of its own: the control's keyboard applies.

## Focus

Nothing of its own. A click on the Label focuses the Control, or clicks a labelable control (it
toggles a Checkbox, as a native `<label for>` does). A picker's Trigger is only focused: a click
would open its popup, which takes the focus away from the field the label names.

## Pointer

A press on the Label acts as above (native `<label>` behaviour).

## Animation

None of its own. Base UI's `data-starting-style` / `data-ending-style` on the Error are out of
scope.

## RTL

Nothing changes.

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios).

### `/field/basic`

A `<form>` with:

- a field `name="email"`: Label **"Email"**; a Control `type="email"`, `required`; Description
  **"We never share it."**; an Error `match="valueMissing"` **"Enter your email."**; an Error
  `match="typeMismatch"` **"Enter a valid email."**;
- a field `name="nickname"`, `disabled`: Label **"Nickname"**, a Control, Description
  **"Shown on your profile."**;
- a **"Submit"** button.

Output: `form: ...`.

Checks:

1. A `textbox` named "Email", described by "We never share it.", not `aria-invalid`; no error is
   shown.
2. A click on the label "Email" focuses the textbox.
3. Focusing it and leaving it empty shows nothing (the required rule, `onSubmit`).
4. "Submit" while empty submits nothing (`form: none`) and focuses "Email". The textbox is
   `aria-invalid="true"`, "Enter your email." is shown, and the description is
   "We never share it. Enter your email.".
5. After that submission the field validates on every change. Typing `ada` shows
   "Enter a valid email." instead. Completing it to `ada@example.com` hides it and removes
   `aria-invalid`. "Submit" then gives `form: email=ada@example.com`. The disabled field submits
   nothing.
6. The textbox "Nickname" is disabled.
7. Axe finds no violation, before and after the failed submission.

### `/field/validation`

The three modes, and `validate`:

- **"Username"**, `validationMode="onChange"`, not in a form. Its `validate` returns
  **"At least 3 characters."** for one or two characters, `null` otherwise. An Error with no
  children.
- **"Password"**, `validationMode="onBlur"`, not in a form. Its `validate` returns a list: each of
  **"Include a number."** (no digit) and **"At least 8 characters."** (fewer than 8) that applies,
  in that order. An Error with no children.
- **"Code"**, the default `onSubmit`, inside a `<form>` with `name="code"` and a **"Submit"**
  button. A Control `pattern="[A-Z]{3}"`. Its `validate` returns **"This code is taken."** for
  `AAA`. It has an Error `match="patternMismatch"` **"Use three capital letters."** and an Error
  `match="customError"` with no children.

Output: `form: ...`.

Checks:

1. **onChange.** Nothing is shown at first. Typing `a` shows "At least 3 characters." and makes
   "Username" `aria-invalid`. Typing on to `ada` hides it.
2. **onBlur.** Typing `abc` in "Password" shows nothing. Leaving it (Tab) shows a list of two
   items, "Include a number." and "At least 8 characters.". Typing `1` hides the error at once
   (a change clears it). Leaving it shows only "At least 8 characters.". Typing on to `abc12345`
   and leaving it shows nothing.
3. **onSubmit.** Typing `ab` in "Code" shows nothing. "Submit" submits nothing, focuses "Code" and
   shows "Use three capital letters.". After that, each change validates. Replacing the text with
   `AAA` shows "This code is taken." instead. Replacing it with `ABC` shows nothing, and "Submit"
   gives `form: code=ABC`.
4. Axe finds no violation with the errors shown.

### `/field/controls`

A `<form>` with three fields around the integrated controls. The controls have no `name` of their
own: the field gives it.

- `name="terms"`: a Checkbox `required` (with its Indicator), then the Label **"Accept terms"**;
  Description **"Required to continue."**; an Error **"You must accept the terms."**;
- `name="fruit"`: Label **"Fruit"**; the Select of [select.md](select.md#selectbasic) (its items,
  placeholder **"Choose a fruit"**), `required`; Description **"Pick one."**; an Error
  **"Choose a fruit."**;
- `name="volume"`: Label **"Volume"**; a Slider with `defaultValue` `50` and one Thumb with no
  name of its own; Description **"From 0 to 100."**;
- a **"Submit"** button.

Output: `form: ...`.

Checks:

1. The `checkbox` "Accept terms" is described by "Required to continue.". A click on the label
   checks it, and another unchecks it.
2. The `combobox` "Fruit" is described by "Pick one.".
3. The `group` and the `slider` are named "Volume". The slider is described by "From 0 to 100.".
4. "Submit" with nothing chosen submits nothing. The checkbox and the combobox are
   `aria-invalid="true"`, and "You must accept the terms." and "Choose a fruit." are shown. The
   checkbox's description is "Required to continue. You must accept the terms.".
5. After that, each change validates. Checking the checkbox hides its error and removes
   `aria-invalid`. Choosing "Banana" hides the select's. "Submit" then gives
   `form: terms=on&fruit=banana&volume=50`.
6. A form reset (`form.reset()`) returns every control to its default: the checkbox unchecked,
   the select's placeholder, the slider at 50; the fields keep their states (no `dirty` reset,
   [below](#differences-from-base-ui)). "Submit" then submits nothing again.
7. Axe finds no violation, before and after the failed submission.

### `/field/async`

A `<form>` with a field `name="username"`, `validationMode="onChange"`: Label **"Username"**; a
Control; an Error with no children; a **"Submit"** button. Its `validate` returns a promise that
resolves after 400 ms for `ada` and after 50 ms for any other value: **"This username is taken."**
for `ada`, `null` otherwise. Output: `resolved: <the value of the last promise that resolved>`,
`form: ...`.

Checks:

1. Typing `ada` shows nothing at once; once `resolved: ada`, "This username is taken." is shown
   and the textbox is `aria-invalid="true"`.
2. **Latest wins.** Replacing the text with `adb` right after `ada` (the `ada` promise resolves
   after the `adb` one: `resolved: ada` comes last) shows nothing: the textbox is not
   `aria-invalid`.
3. With `ada` shown as taken, "Submit" submits nothing (`form: none`) and focuses the textbox:
   the run that resolved set its custom validity, and the unchanged value is not validated again.
4. Replacing the text with `grace` hides the error once it resolves; "Submit" gives
   `form: username=grace`.
5. Axe finds no violation with the error shown.

### `/field/async-blur`

A field `name="username"`, `validationMode="onBlur"`, not in a form: Label **"Username"**; a
Control; an Error with no children; then a button **"After"**. Its `validate` returns a promise
that resolves after 400 ms for every value: **"This username is taken."** for `ada`, `null`
otherwise (Epic #49). Output: `resolved: <the value of the last promise that resolved>`.

Checks:

1. Typing `ada` shows nothing; leaving it (Tab) shows "This username is taken." once
   `resolved: ada`, and the textbox is `aria-invalid="true"`.
2. Typing one more letter (`adax`) hides the error at once: it is gone and the textbox is not
   `aria-invalid` while `resolved` is still `ada` (the change's run has not settled).
3. Once `resolved: adax`, nothing is shown; leaving it shows nothing (not taken).

### `/field/match`

A `<form>` with a field `name="age"`: Label **"Age"**; a Control `type="number"`, `required`,
`min="18"`, `max="120"`; an Error `match="valueMissing"` **"Enter your age."**; an Error whose
`match` is a function, true for `rangeUnderflow` or `rangeOverflow`, **"Enter an age from 18 to
120."**; a **"Submit"** button. Output: `form: ...`.

Checks:

1. "Submit" while empty submits nothing and shows "Enter your age." only.
2. Typing `12` shows "Enter an age from 18 to 120." only (each change validates after the
   submission); `130` likewise; `30` shows neither.
3. "Submit" gives `form: age=30`.
4. Axe finds no violation with an error shown.

### `/field/settings`

A `<form>` with two fields around the controls of Epic #29; the controls have no `name` of their
own:

- `name="contact"`: Label **"Contact by"**; a RadioGroup `required` (no `aria-labelledby` of its
  own) with **"Email"** and **"Phone"** (values `email`, `phone`), each a Radio.Root inside a
  `<label>` with its text; Description **"How we reach you."**; an Error
  **"Choose how we reach you."**;
- `name="alerts"`: a Switch with `uncheckedValue="off"`, then the Label **"Email alerts"**;
  Description **"A weekly digest."**;
- buttons **"Submit"** and **"Reset"** (`type="reset"`).

Output: `form: ...`.

Checks:

1. A `radiogroup` named "Contact by", described by "How we reach you."; a `switch` named
   "Email alerts", described by "A weekly digest.". A click on the label "Email alerts" turns it
   on, and another off.
2. "Submit" submits nothing and focuses "Email". The radiogroup is `aria-invalid="true"` and
   "Choose how we reach you." is shown; its description is "How we reach you. Choose how we reach
   you.".
3. Checking "Phone" hides the error and removes `aria-invalid`. "Submit" then gives
   `form: contact=phone&alerts=off`; with the switch on, `form: contact=phone&alerts=on`.
4. "Reset" returns both controls to their defaults (no radio checked, the switch off); "Submit"
   then submits nothing again.
5. Axe finds no violation, before and after the failed submission.

### `/field/more-controls`

A [Form](form.md) with three fields around the controls added in stage 1; the controls have no
`name` of their own:

- `name="toppings"`: Label **"Toppings"**; a CheckboxGroup (no `aria-labelledby` of its own)
  with **"Cheese"**, **"Ham"** and **"Pineapple"** (values `cheese`, `ham`, `pineapple`);
  Description **"Pick at least one."**; an Error with no children. Its `validate` returns
  **"Choose a topping."** for an empty array.
- `name="arrival"`: Label **"Arrival"**; a DatePicker `required` (en-US) whose Trigger reads
  the value (or "none"), its Popup (`aria-label` **"Choose date"**) holding a
  bound Calendar with **"Previous month"** / **"Next month"**; Description
  **"The day you arrive."**; an Error **"Choose a date."**.
- `name="stay"`: Label **"Stay"**; a DateRangePicker `required` (en-US) whose Trigger reads
  the range (or "none"), its Popup (`aria-label` **"Choose dates"**) holding a
  bound RangeCalendar; Description **"From check-in to check-out."**; an Error
  **"Choose your dates."**.
- a **"Submit"** button.

"Today" is 2026-11-20. Output: `form: ...` (the Form's submission, as a native form's).

Checks:

1. A `group` named "Toppings", described by "Pick at least one."; a `button` named "Arrival none"
   (the label, then its content), described by "The day you arrive."; a `button` named
   "Stay none", described by "From check-in to check-out.". A click on the label "Arrival"
   focuses its trigger (and opens nothing).
2. "Submit" submits nothing and focuses "Cheese" (the first invalid field's focus target). The
   group and both triggers are `aria-invalid="true"`, and "Choose a topping.", "Choose a date."
   and "Choose your dates." are shown; the group's description is "Pick at least one. Choose a
   topping.".
3. Checking "Ham" hides the group's error. Choosing November 24 in "Arrival" hides its error (the
   trigger reads "2026-11-24", named "Arrival 2026-11-24"); choosing November 25 then 27 in "Stay" hides its own.
4. "Submit" gives `form: toppings=ham&arrival=2026-11-24&stay=2026-11-25/2026-11-27`.
5. A form reset (`form.reset()`) returns every control to its default (no topping, both triggers
   read "none"); "Submit" then submits nothing again.
6. Axe finds no violation, before and after the failed submission.

## Differences from Base UI

Measured by the POC against Base UI 1.9 (`Field`, with `Checkbox`, `Select` and `Slider`): Base UI
passes every Field behaviour test, once its `onSubmit` mode is given the `Form` it needs (without
it, a native submission validates no field).

Where the primitives still differ from Base UI, without a behaviour test telling them apart:

- **A native form is enough.** A field validates on its native form's submission attempt (the
  browser's validation), and keeps the custom validity current so the browser blocks a rejected
  value. Base UI needs its `Form` for `onSubmit`; here [Form](form.md) adds server errors, the
  Form-wide `validationMode` and the validation of controls the browser cannot validate.
- **`match` as a function** (`(validity) => boolean`) is this library's addition; Base UI takes a
  key or `true`.
- **Async `validate`: a value already validated is not validated again**, so a submission with an
  unchanged value is blocked by the last answer. Base UI validates again and does not wait.
- **A disabled field shows no state of validity**, even with server errors or `invalid` (the POC's
  rule, kept); Base UI keeps the app's invalid state on a disabled field.
- **`match={true}`** follows Base UI: always shown. The messages of `validate` are matched with
  `match="customError"`, the `ValidityState` key for them.
- **A form reset** does not reset the field's states (`dirty`, `touched`, the validity), as in Base
  UI. The controls still reset their values (spec/README.md, "Forms").
