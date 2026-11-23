# OTPField

## Purpose

A one-time code entered one character per slot (a sign-in code, a verification code): typing
moves forward, Backspace moves back, a paste or the browser's one-time-code autofill fills the
slots, and the code works in a native `<form>` and in a [Field](field.md). A password is a text
input; a number is a [NumberField](number-field.md).

**Scope: stage 2** (Epic #52, Issue #51). **The APG has no pattern for it.** The Issue says Base UI
has none either, but Base UI 1.9 (the reference checkout, `references/base-ui`) ships an
`OTPField`, so D4 applies as written: where the APG has no rule, Base UI decides. The APG decides
what it can: each slot is a native text input (the APG's text editing, no captured editing key
but the ones below), the slots are a `group` (the APG's grouping of related controls), and every
slot has an accessible name. axe is the referee of the result (Issue #51).

### The input model, decided

**One native input per slot** (Base UI's model), not one hidden input under visual slots.

- Each slot is a real `input`, focused, named and announced on its own: a screen reader hears
  the slot's name (the consumer's "Digit 2 of 6") and its character; a visual slot over one hidden
  input has no element to name, and its caret, selection and focus ring are simulated.
- The slots form a `group` named by the label, with **one tab stop** (a roving `tabindex`, the
  APG's composite rule): Tab enters the code once and leaves it once.
- Autofill still works: the first slot has `autocomplete="one-time-code"` and `maxlength` the
  code's length, so a browser or a password manager fills it and the value spreads to the slots.

Discarded: a single input with visual slots (the input-otp model): one accessible name for the
whole code, so axe cannot tell a slot's position and the Issue's criterion (each slot says its
position) has nothing to hold it.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| OTPField.Root | `div` | `otp-field-root` | the `group`; holds the value; renders the hidden input after its children |
| OTPField.Input | `input` | `otp-field-input` | one per slot, in document order |
| (hidden input) | `input type="text"` | `otp-field-hidden-input` | rendered by the Root; what the form submits and validates |

The Issue's `HiddenInput` is not a part the consumer renders: the Root renders it, as every form
control of this library does (spec/README.md, "Forms"). One entry, `/otp-field` (D8), built on
Field (`ENTRY_DEPENDENCIES`: `otp-field` on `field`); its value rules are the toolkit's `/form`
(`normalizeOtp`, `replaceOtp`, `removeOtpCharacter`, `otpPattern`).

## API

**OTPField.Root**:

- `length` (required): the number of slots. The value is at most `length` characters.
- `value`, `defaultValue` (`""`), `onValueChange(value, details)`: the code typed so far, a
  string with no gap (a slot is filled only after the ones before it). `details` is
  `{ reason, event }`, not cancelable.
- `onValueComplete(value, details)`: the value became `length` characters long (after
  `onValueChange`), or a complete code was pasted again (Base UI's name; the Issue's
  `onComplete`).
- `onValueInvalid(text, details)`: typed or pasted text held characters `validationType`
  refuses; `text` is what was typed or pasted. Whitespace is dropped silently.
- `validationType` (`"numeric"`): the characters a slot accepts: `"numeric"` (digits),
  `"alpha"` (ASCII letters), `"alphanumeric"`, `"none"` (any character but whitespace), or a
  `RegExp` one character must match (the Issue's "a pattern", in place of Base UI's
  `normalizeValue`).
- `mask` (`false`): the slots are `type="password"` (the characters hidden).
- `autoComplete` (`"one-time-code"`): the first slot's and the hidden input's `autocomplete`;
  the other slots have `autocomplete="off"`.
- `inputMode`: the slots' virtual keyboard; default `numeric` for `"numeric"`, else `text`.
- `required`, `readOnly`, `disabled` (`false`), `name` (the Field's wins), `id`: the first
  slot's `id` (generated unless the consumer gives one, or the Field's control id); slot `n` gets
  `<id>-<n>` (Base UI).

**OTPField.Input**: no props of its own. Its accessible name is the consumer's: an `aria-label`
(or `aria-labelledby`) that says the slot's position ("Digit 2 of 6"); a slot with none is
labelled by the Field's label. No text of the library's own (spec/README.md).

Change reasons (spec/README.md): `input-change` (typed text, autofill), `input-clear` (a slot's
character deleted by the input itself), `input-paste` (a paste), `keyboard` (Backspace, Delete),
`none` (a form reset).

### Typing

A slot holds one character. Focusing a slot selects its character, so a typed character replaces
it.

- **A typed character** the type accepts fills the slot and the focus moves to the next slot
  (the last slot keeps it). Typing the character a slot already holds only moves on.
- **A refused character** changes nothing: the slot keeps its character, the focus stays, and
  `onValueInvalid` reports it.
- **A paste** (or several characters at once, autofill) spreads its accepted characters from the
  focused slot on (whitespace dropped; refused characters dropped and reported), up to `length`;
  the focus moves to the slot after the last one filled (the last slot at most). A paste with no
  accepted character changes nothing.
- The value never has a gap: a slot after the first empty one cannot take the focus by pointer or
  key; a press on it focuses the first empty slot.

### Forms

The Root renders one visually hidden text input (`otp-field-hidden-input`, spec/README.md
"Forms": `aria-hidden="true"`, `tabindex="-1"`), with the field's `name`, the value, `required`,
`disabled`, `autocomplete`, `maxlength` the length and `pattern` a complete code (`\d{6}` for six
digits, the toolkit's `otpPattern`): a native form refuses an empty required code
(`valueMissing`) and an incomplete one (`patternMismatch`), and resets it; a reset returns an
uncontrolled field to its `defaultValue` (reason `none`) and writes the rendered value back onto
the hidden input (docs/decisions.md). When the hidden input is the form's first invalid control,
the first empty slot (else the last) takes the focus. A focus on the hidden input goes to the first
slot.

### In a Field

The OTPField is a Field control (spec/field.md, "Integration contract"): its labelable element is
the first slot (`id`, `for`); the Root (the `group`) gets `aria-labelledby` (the label) and
`aria-describedby`; every slot gets `aria-invalid`, and a slot with no name of its own
`aria-labelledby` the label; `validate` receives the value (a string); focus and blur come from
the slots (focus within the group; `touched` once focus leaves it); the validated element is the
hidden input; the Field's state attributes are on every part.

## State attributes and ARIA

Every part carries `data-disabled`, `data-readonly`, `data-required` and `data-complete` (the
value is `length` long), and inside a Field the Field's state (`data-invalid`, `data-valid`,
`data-dirty`, `data-touched`, `data-filled`, `data-focused`).

| part | attributes |
| --- | --- |
| Root | `role="group"`, `aria-labelledby` and `aria-describedby` inside a Field |
| Input | `id`, `type="text"` (`"password"` with `mask`), `inputmode`, `autocomplete` (the first slot's `one-time-code`, the others `off`), `autocorrect="off"`, `spellcheck="false"`, `maxlength` (the length, on the first slot only: a password manager's bubble stays on it), `enterkeyhint` (`next`, `done` on the last), the roving `tabindex` (`0` on the tab stop, `-1` on the others), `disabled`, `readonly`, `aria-invalid` inside an invalid Field, `data-filled` while it holds a character, `data-index` (its index, a value) |

**The tab stop** is the focused slot while focus is inside; else the first empty slot (the last
when the code is complete). Before the slots are known (a server render, the first render), every
slot has `tabindex="-1"` and shows no character; once mounted they take their index in document
order (as [Toolbar](toolbar.md)'s items).

## Keyboard

On a slot (Base UI; the arrows mirrored in RTL):

| key | does |
| --- | --- |
| ArrowLeft, ArrowRight | the previous or the next slot (in RTL, ArrowLeft is the next); Control or Meta: the first slot, or the first empty one |
| Home, ArrowUp | the first slot |
| End, ArrowDown | the first empty slot (the last when complete) |
| Backspace | removes the slot's character and focuses the previous slot; on an empty slot, removes the previous slot's character and focuses it (`keyboard`); Control or Meta: clears the code and focuses the first slot |
| Delete | removes the slot's character, the later ones move back, the focus stays (`keyboard`) |
| Tab, Shift+Tab | leave the code (one tab stop) |

Nothing changes the value while read-only or disabled; the arrows still move in a read-only code.

## Focus

One tab stop (above). A focused slot selects its character. A mouse press on a slot focuses it
(or the first empty slot) without placing a caret inside its character.

## Pointer

A press on a slot focuses it, or the first empty slot when it lies after it (no gap).

## Animation

None.

## RTL

The slots follow the document's direction (the first slot at the right); ArrowLeft and ArrowRight
are mirrored (the direction provider, else the computed direction). The value is still read in
slot order.

## Scenarios

The form scenarios print the submission as `form: <key=value&...>` (spec/checkbox.md,
"Scenarios"). Every scenario prints `value: <the last onValueChange's value>` (`none` before any,
`empty` for `""`), `reason: <its reason>`, `complete: <the last onValueComplete's value>` and
`invalid: <the last onValueInvalid's text>` (`none` before any).

### `/otp-field/basic`

A native `<form>`: a [Label](label.md) **"Verification code"** (`id="code-label"`,
`htmlFor="code"`); an OTPField `id="code"`, `name="code"`, `length` `6`,
`aria-labelledby="code-label"` on its Root, with six Inputs named **"Digit 1 of 6"** to
**"Digit 6 of 6"** (`aria-label`); buttons **"Submit"** and **"Reset"**. Then an OTPField
**"Backup code"** (`aria-label` on its Root), `length` `4`, `readOnly`, `defaultValue` `"2468"`,
its slots named "Backup digit 1 of 4" to "Backup digit 4 of 4"; and an OTPField **"Old code"**,
`length` `4`, `disabled`, its slots "Old digit 1 of 4" to "Old digit 4 of 4".

Checks:

1. A `group` named "Verification code" with six `textbox`es "Digit 1 of 6" … "Digit 6 of 6";
   only the first has `tabindex="0"`, `autocomplete="one-time-code"` and `maxlength="6"`, the
   others `autocomplete="off"`.
2. A click on the label focuses "Digit 1 of 6". Typing `1` gives `value: 1` (`input-change`) and
   focuses "Digit 2 of 6"; typing `a` there is refused (`invalid: a`, `value: 1`, the focus
   stays); typing `23456` gives `value: 123456`, `complete: 123456`, and the focus stays on
   "Digit 6 of 6" (`data-complete` on the Root).
3. Backspace on "Digit 6 of 6" gives `value: 12345` (`keyboard`) and focuses "Digit 5 of 6";
   ArrowLeft focuses "Digit 4 of 6", Home "Digit 1 of 6", End "Digit 6 of 6" (the first empty).
4. Delete on "Digit 2 of 6" gives `value: 1345`; Control+Backspace clears it (`value: empty`)
   and focuses "Digit 1 of 6".
5. A click on "Digit 5 of 6" while the value is `12` focuses "Digit 3 of 6".
6. Pasting `98 76 54` into "Digit 1 of 6" gives `value: 987654` (`input-paste`) and
   `complete: 987654`; pasting `12-34` into an empty code gives `value: 1234` and
   `invalid: 12-34`.
7. "Submit" with `987654` gives `form: code=987654`; with `12` it submits nothing (an incomplete
   code) and focuses "Digit 3 of 6".
8. "Reset" empties it (every slot empty, the tab stop back on "Digit 1 of 6").
9. "Backup code": its slots hold `2`, `4`, `6`, `8`; typing changes nothing; ArrowRight still
   moves. "Old code": every slot is disabled.
10. Tab from "Digit 1 of 6" leaves the code (the next focused element is outside its group).
11. Axe finds no violation, empty and complete.

### `/otp-field/basic?dir=rtl`

The same page right to left: "Digit 1 of 6" is the rightmost slot, and ArrowLeft moves from it
to "Digit 2 of 6".

### `/otp-field/field`

A native `<form>` with a `Field.Root name="otp"`: a `Field.Label` **"Sign-in code"**, an OTPField
`length` `4`, `required`, `validationType="alphanumeric"`, `mask`, whose slots are named
**"Character 1 of 4"** to **"Character 4 of 4"**, a Description **"Check your email."**, an Error
**"Enter the 4-character code."** with no `match`; a button **"Submit"**.

Checks:

1. A `group` named "Sign-in code" described by "Check your email."; its slots are password inputs
   (`type="password"`) named "Character 1 of 4" … "Character 4 of 4".
2. "Submit" submits nothing (`form: none`), focuses "Character 1 of 4", sets `aria-invalid="true"`
   on every slot and shows the error.
3. Typing `ab1` keeps the error (incomplete); `2` completes it (`complete: ab12`) and hides the
   error; "Submit" gives `form: otp=ab12`.
4. Typing `-` in a slot is refused (`invalid: -`).
5. Axe finds no violation, before and after the failed submission.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI ignores (with a warning) an `aria-label` on the first slot and labels it by the field's label | the consumer's name wins on every slot, so each one says its position (Issue #51); a slot with no name takes the field's label |
| Base UI's `normalizeValue` | `validationType` takes a `RegExp` (the Issue's "a pattern"); uppercasing and other normalizations are the consumer's (`value` + `onValueChange`) |
| Base UI defers a slot's change during an IME composition (`compositionend`) | not yet: a composing input method commits each update to the slot (a known limit, for `alpha` and wider types; digits are never composed) |
| Base UI's `autoSubmit`, `form`, `Separator`, cancelable change details | out of scope: `onValueComplete` can submit; a separator is the consumer's own element or a [Separator](separator.md) |
