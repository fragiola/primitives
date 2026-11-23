# Label

## Purpose

A standalone `<label>` that names a control outside a [Field](field.md): a native input, a
Checkbox, a Switch, a Select's trigger, a NumberField's input, a Slider's thumb. It names its
control by `for` (React `htmlFor`) or by wrapping it, a press on it reaches the control, and a
double press selects none of its text. Inside a Field, `Field.Label` names the field's control
(it also wires the ids and the description): use one or the other.

**Scope: stage 2** (Epic #52, Issue #50). The HTML `label` element decides the naming and the
activation; Radix's and Base UI's label decide the double press (D4: the APG has no label
pattern).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Label | `label` | `label-root` | one part |

One entry, `/label` (D8), built on no other component; its press helpers are the toolkit's
`/form` (`preventLabelSelection`, `labelFocusTarget`).

## API

**Label**:

- `htmlFor` (React; Vue and Angular: the native `for` attribute): the `id` of the control it
  names. Without it, a Label names the labelable control it wraps (HTML).
- `id`: forwarded (a control that a `<label for>` cannot name, a `slider` or a `group`, takes it
  in its own `aria-labelledby`).

Every other attribute and handler is forwarded; handlers compose internal first, then the
consumer's (AGENTS.md rule 7).

## State attributes and ARIA

None: a Label carries its part attribute only. Its control's accessible name comes from it the
way HTML's `label` gives one: through `for`, or by wrapping. A control that `for` cannot name (a
Slider's thumb, a `div`) is named by its own `aria-labelledby` pointing at the Label's `id` (the
consumer's, as with a native label).

## Keyboard

None: a label is not focusable.

## Focus

None of its own; a press moves the focus to the control (Pointer).

## Pointer

- A press activates the control as a native `<label>` does: a text input or a NumberField's input
  takes the focus, a Checkbox, a Switch or a Radio toggles, a button (a Select's trigger) is
  clicked.
- When `for` names an element that is not labelable (a Slider's thumb, a `div` around a group), a
  press focuses that element if it can take the focus, else its first focusable descendant
  (the toolkit's `labelFocusTarget`): a native label would do nothing.
- A double press (or a triple one) selects none of the Label's text: its `mousedown` default is
  prevented when `detail > 1` (Radix, Base UI), unless the press lands on a control inside the
  label (`button`, `input`, `select`, `textarea`), whose text editing stays.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/label/controls`

A page with a Label for each kind of control, none inside a Field:

- **"Email"** (`htmlFor="email"`) and a native text `<input id="email">`;
- a Label wrapping a Checkbox and the text **"Subscribe"**;
- **"Notifications"** (`htmlFor="notifications"`) and a Switch with `id="notifications"`;
- **"Quantity"** (`htmlFor="quantity"`) and a NumberField (`id="quantity"`, `defaultValue` `1`,
  `locale="en-US"`) whose Input it names;
- **"Volume"** (`id="volume-label"`, `htmlFor="volume"`) and a Slider (`defaultValue` `40`) whose
  Thumb has `id="volume"` and `aria-labelledby="volume-label"`.

Output: `subscribe: <true|false>` (the Checkbox's last `onCheckedChange`, `none` before any),
`notifications: <true|false>` (the Switch's, `none` before any).

Checks:

1. A `textbox` named "Email", a `checkbox` named "Subscribe", a `switch` named "Notifications", a
   `spinbutton` named "Quantity", a `slider` named "Volume"; every Label carries
   `data-primitives-part="label-root"`.
2. A click on "Email" focuses its input; a click on "Quantity" focuses the NumberField's input.
3. A click on "Subscribe" checks the Checkbox (`subscribe: true`); a click on "Notifications"
   turns the Switch on (`notifications: true`).
4. A click on "Volume" focuses the Slider's Thumb.
5. A double click on "Email" selects no text (the document's selection is empty), and so does a
   double click on "Volume".
6. Axe finds no violation.

## Differences from Base UI

Base UI has no standalone label (its `Field.Label` is this library's). Radix's `Label` decides the
double press.

| difference | decision |
| --- | --- |
| Radix's `Label` does nothing for a `for` that names no labelable element | it focuses that element, or its first focusable descendant, so a Label works with a Slider (Issue #50: "works with every Stage 0–1 control"); `Field.Label` does the same for a Slider (spec/slider.md) |
