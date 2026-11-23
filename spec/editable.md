# Editable

## Purpose

A text shown as plain text that turns into a text field to edit it in place: a document's title,
a list's name, a table cell's note. The Preview shows the value; activating it (a focus, a
press, a double press, or the EditTrigger) shows the Input with the text selected; Enter, a blur
or the SubmitTrigger commits the edit, Escape or the CancelTrigger reverts it, and the focus goes
back to where the edit started. It is a form control: it submits, resets and validates, alone or
in a [Field](field.md).

It is not a rich text editor (one line, or a `<textarea>` for several), nor a form of several
fields (a [Form](form.md)).

**Scope: stage 4** (Epic #94, Issue #93). The APG has no inline edit pattern and Base UI has no
Editable: the behaviour references are Zag/Ark's Editable and Reka UI's Editable (read, never
copied). Where the APG is silent, the APG-closest option is decided here (D4) and recorded in
`docs/decisions.md` ("Text inputs"):

- the **Input is a native text field** (`input`, or a `textarea` the app renders), named by the
  field's label: the APG's textbox; the Preview is the text, not a widget (no role);
- the **value follows the Input while editing** (Zag's): `onValueChange` reports every keystroke,
  `onValueCommit` the value an edit ends with, `onValueRevert` the value a revert goes back to;
- the **focus returns** after an edit to the EditTrigger when there is one, else to the Preview
  (without starting a new edit), unless the edit ended because the focus moved elsewhere
  ("Focus", every path listed).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `editable-root` | holds the value and the edit |
| Area | `div` | `editable-area` | holds the Preview and the Input |
| Preview | `span` | `editable-preview` | the value (or the placeholder); `hidden` while editing |
| Input | `input` | `editable-input` | the text field (or the app's `textarea`); `hidden` until an edit starts; the form control and the labelled control |
| EditTrigger | `button` | `editable-edit-trigger` | starts an edit; `hidden` while editing |
| SubmitTrigger | `button` | `editable-submit-trigger` | commits the edit; `hidden` until one starts |
| CancelTrigger | `button` | `editable-cancel-trigger` | reverts the edit; `hidden` until one starts |

Every part is always rendered (a hidden part carries `hidden`), so an Angular directive needs no
structural form and a server render matches the hydrated one. One entry, `/editable` (D8), built
on no other component; a Field control (`ENTRY_DEPENDENCIES`: `field`). It uses the toolkit's
`/form` (the form bridge) only. It has no Label part: the Field's Label names the Input (or a
`<label for>` its `id`, or the app's `aria-label`).

## API

**Root**:

- `value`, `defaultValue` (`""`), `onValueChange(value, details)`: the text. Reasons:
  `input-change` (typing), `escape-key`, `cancel-press`, `input-blur` (a revert back to the value
  the edit started from), `none` (a form reset).
- `onValueCommit(value, details)`: an edit ended by committing (also when the text did not
  change). Reasons: `keyboard` (Enter), `submit-press` (the SubmitTrigger), `input-blur` (the
  focus left, `submitMode` `blur` or `both`).
- `onValueRevert(value, details)`: an edit ended by reverting, with the value it went back to.
  Reasons: `escape-key`, `cancel-press`, `input-blur` (the focus left, `submitMode` `enter` or
  `none`).
- `activationMode` (`"focus"`): what starts an edit on the Preview: `"focus"` (the Preview is a
  tab stop and focusing it edits), `"click"`, `"dblclick"`, or `"none"` (only the EditTrigger).
- `submitMode` (`"both"`): what commits: `"enter"` (Enter; leaving reverts), `"blur"` (leaving;
  Enter does nothing), `"both"`, or `"none"` (only the SubmitTrigger; leaving reverts).
- `placeholder` (a string): the Preview's text while the value is empty, and the Input's
  `placeholder`.
- `maxLength` (a number): the Input's `maxlength`; a longer value given by the app is shown and
  submitted as given (the browser refuses only typing past it).
- `readOnly` (`false`): no edit starts; the Preview is not a tab stop; the EditTrigger is
  disabled.
- `disabled` (`false`): as `readOnly`, and every part carries `data-disabled`, the Input and the
  triggers `disabled`.
- `required` (`false`): the Input is `required`.
- `name`: the Input's `name`.
- `id`: the Input's `id` (generated when not given).

**Input**: a native `input` (or the app's `textarea` through `render`; Vue: `as="textarea"`;
Angular: the directive on a `<textarea>`); every attribute is forwarded.

**Preview**: renders the value, or the `placeholder` while the value is empty; it takes no
children.

**EditTrigger, SubmitTrigger, CancelTrigger**: native `button`s; their content and names are the
app's.

Every part's `render` and `className` functions (Vue: the `render` slot; Angular: `state()`
through `exportAs`, `#title="editableRoot"`) receive the state `{ value, editing, empty,
disabled, readOnly, required }`.

**Inside a [Field](field.md)** (its integration contract): the Input is the labelable element
(`id`, `for`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, the field's states) and the
validated element; `validate` receives the value; the field's `name` and `disabled` win. Focus
and blur are the Input's. Focus target: the Input while editing, else the Preview (in `"focus"`
mode, focusing it starts an edit). A press on the Field's Label while the Preview shows does
nothing (its `for` names the hidden Input; Zag's Label focuses the Preview, which the shared
Field.Label does not know of).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| every part | `data-editing` while editing, `data-empty` while the value is `""`, `data-disabled`, `data-readonly`, `data-required` |
| Root | inside a Field, the field's state attributes |
| Preview | `hidden` while editing; `tabindex="0"` with `activationMode` `"focus"`, `"-1"` in the other modes (it takes the focus back after an edit), none while disabled or read-only; `data-placeholder` while it shows the placeholder |
| Input | `hidden` until an edit starts; `id`, `name`, `value`, `placeholder`, `maxlength`, `required`, `disabled` (never `readonly`: a read-only Root never edits); inside a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` and the field's state attributes |
| EditTrigger | `type="button"`, `hidden` while editing, `disabled` while disabled or read-only, `aria-controls` the Input's `id` |
| SubmitTrigger, CancelTrigger | `type="button"`, `hidden` until an edit starts, `disabled` while disabled |

## Keyboard

| key | where | action |
| --- | --- | --- |
| Tab | Preview (`"focus"` mode) | focusing it starts an edit |
| Enter | Preview (focused, any mode but `"none"`) | starts an edit |
| Enter | Input (`submitMode` `"enter"` or `"both"`) | an `input`: commits (reason `keyboard`; its default prevented, so the form is not submitted); a `textarea`: inserts a line break |
| Ctrl+Enter, Meta+Enter | a `textarea` Input (`"enter"` or `"both"`) | commits (reason `keyboard`) |
| Enter | Input (`"blur"` or `"none"`) | not handled (an `input` submits its form, as any text input) |
| Escape | Input | reverts (reason `escape-key`), its default prevented (a dialog around it stays open) |
| Tab, Shift+Tab | Input | moves on; the blur ends the edit (below), unless the focus goes to the SubmitTrigger or the CancelTrigger |

A key while the IME composes (`isComposing`) is not handled.

## Focus

**Starting an edit** focuses the Input and selects its whole text (after the render that shows
it), from every activation: the Preview's focus, press or double press, Enter on the Preview, the
EditTrigger.

**Leaving an edit**, every path (the Epic's risk; each one is a scenario check):

| how the edit ends | committed or reverted | where the focus goes |
| --- | --- | --- |
| Enter (Ctrl/Meta+Enter in a `textarea`) | committed | the **return target**: the EditTrigger when it is rendered and enabled, else the Preview, which then does not start a new edit |
| Escape | reverted | the return target |
| a press on the SubmitTrigger | committed | the return target |
| a press on the CancelTrigger | reverted | the return target |
| Tab or Shift+Tab, or a press on another focusable element | committed with `submitMode` `"blur"` or `"both"`, reverted with `"enter"` or `"none"` | where it went (it is not moved) |
| a press on a spot that takes no focus (the page's background), the focus falling to the `body` | as above | the return target |
| the window losing the focus (another window, another tab) | the edit goes on | nothing moves; the Input has the focus again with the window |
| a form reset | the edit ends, neither committed nor reverted (the value returns to its default, reason `none`) | the return target, when the focus was in the edit; else it stays |

The focus moving between the Input, the SubmitTrigger and the CancelTrigger does not end the
edit. Only a blur of one of those three ends it, once the focus is outside the three of them (the
EditTrigger or the Preview, hidden while focused as an edit starts, may report a blur with no
`relatedTarget`: it is not the edit's).

## Pointer

| press | where | action |
| --- | --- | --- |
| click | Preview (`activationMode` `"click"`) | starts an edit |
| double click | Preview (`"dblclick"`) | starts an edit |
| click | Preview (`"focus"`) | the focus it takes starts an edit |
| click | EditTrigger | starts an edit |
| click | SubmitTrigger / CancelTrigger | commits / reverts |

While disabled or read-only, nothing starts an edit.

## Forms

The Input is the form control, always rendered (a `hidden` input still submits): it carries
`name`, `required`, `maxlength` and `disabled`, and submits the value (the text being edited,
while an edit runs). A form reset returns an uncontrolled Root to its `defaultValue` (a
controlled one reports it, reason `none`) and ends a running edit (Focus, the reset row). When
the browser's validation finds the Input invalid, its `invalid` event's default is prevented (a
hidden input cannot take the focus or show the browser's bubble) and the focus goes to the focus
target: the Input while editing, else the Preview, which starts an edit in `"focus"` mode.

## RTL

Nothing changes.

## Scenarios

The form scenarios print `form: ...` as in [checkbox.md](checkbox.md#scenarios). The triggers
hold an icon (`aria-hidden="true"`) and are named by `aria-label`. Each fixture prints
`value: ...` (the last `onValueChange`, `none` before any), `commit: ...` (the last
`onValueCommit`'s value and reason, `<value> (<reason>)`, `none` before any) and `revert: ...`
(the last `onValueRevert`'s, likewise), a line break written `\n`; a page with several Roots prints them for each, prefixed
by its label (`name commit: ...`).

### `/editable/basic`

A `<form>` with a `Field.Root`: a `Field.Label` **"Title"**, a Root `name="title"`,
`defaultValue="Quarterly report"`, `placeholder="Untitled"` (the default modes: `"focus"`,
`"both"`), an Area with its Preview and Input, an EditTrigger **"Edit title"**, a SubmitTrigger
**"Save title"** and a CancelTrigger **"Cancel edit"**; after the Field, a button **"After"**
and buttons **"Submit"** and **"Reset"**. Output: `value`, `commit`, `revert`, `form`.

Checks:

1. The Preview shows "Quarterly report" with `tabindex="0"`; there is no `textbox` (the Input is
   hidden); "Edit title" is a button; "Save title" and "Cancel edit" are hidden.
2. Tab from the page start focuses the Preview, which starts an edit: the `textbox` "Title" is
   focused with "Quarterly report" selected; the Preview and "Edit title" are hidden; "Save
   title" and "Cancel edit" are shown; the Root and the Area carry `data-editing`.
3. Typing `Annual report` reports `value: Annual report` (`input-change`); Enter commits it
   (`commit: Annual report (keyboard)`), the Preview shows it, and the focus is on "Edit title".
4. Enter on "Edit title" starts an edit (the text selected); typing `Draft` and Escape reverts
   (`revert: Annual report (escape-key)`, `value: Annual report`), and the focus is on "Edit
   title".
5. "Edit title", typing `Budget`, a click on "Save title": `commit: Budget (submit-press)`, the
   focus on "Edit title". "Edit title", typing `Plan`, a click on "Cancel edit": `revert: Budget
   (cancel-press)`, the focus on "Edit title".
6. "Edit title", then Tab: the focus moves to "Save title" and the edit goes on; Tab to "Cancel
   edit", the edit goes on; Tab again (to "After") commits (`commit: Budget (input-blur)`) and
   the focus stays on "After".
7. "Edit title", typing `Memo`, a click on the page's background: `commit: Memo (input-blur)`,
   the focus on "Edit title".
8. "Submit" submits `form: title=Memo`; "Reset" returns it to "Quarterly report" (`value:
   Quarterly report`, reason none).
9. While editing (the focus in the Input), a `form.reset()` ends the edit (no new `commit` or `revert`), the Preview shows
   "Quarterly report" and the focus is on "Edit title".
10. Axe finds no violation, at rest and editing.

### `/editable/modes`

Four Roots, each in a `Field.Root` with a `Field.Label`, and no EditTrigger unless named; a
button **"After"** at the end. Output: per Root, `value`, `commit` and `revert`, prefixed by its
label.

- **"Name"**: `defaultValue="Ana"`, `activationMode="dblclick"`, `submitMode="enter"`.
- **"Role"**: `defaultValue="Designer"`, `activationMode="click"`, `submitMode="blur"`.
- **"Team"**: `defaultValue="Core"`, `activationMode="none"`, `submitMode="none"`, an
  EditTrigger **"Edit team"** and a SubmitTrigger **"Save team"**.
- **"Notes"**: `defaultValue="First line"`, a `textarea` Input (the default modes).

Checks:

1. "Name": a click on its Preview does not edit; a double click does (the `textbox` "Name"
   focused, its text selected); Enter after typing `Bea` commits (`Name commit: Bea (keyboard)`)
   and the focus returns to its Preview (no EditTrigger), which does not start a new edit; a
   double click, typing `Cy` and Tab (the focus moves on to "Edit team") reverts (`Name revert:
   Bea (input-blur)`).
2. "Role": a click on its Preview edits; Enter after typing `Lead` does not commit (still
   editing); Escape reverts (`Role revert: Designer (escape-key)`) and the focus returns to its
   Preview; a click, typing `Lead`, a click on "After" commits (`Role commit: Lead (input-blur)`)
   and the focus stays on "After".
3. "Team": its Preview is not a tab stop and a click on it does not edit; "Edit team" edits;
   Enter does nothing; a click on "Save team" commits (`Team commit: Core (submit-press)`) and the
   focus returns to "Edit team"; "Edit team", typing `Web`, Tab to "Save team" keeps the edit, a
   click on "After" reverts (`Team revert: Core (input-blur)`).
4. "Notes": Tab to its Preview edits the `textbox` "Notes" (a `textarea`); Enter inserts a line
   break (no commit); Control+Enter commits (`Notes commit: First line\n (keyboard)` with the
   line break) and the focus returns to its Preview, which does not start a new edit.

### `/editable/states`

Three Roots, each in a `Field.Root`, each with an EditTrigger:

- **"Subtitle"**: no default, `placeholder="Add a subtitle"`, `maxLength={12}`, EditTrigger
  **"Edit subtitle"**.
- **"Owner"**: `disabled`, `defaultValue="Ana"`, EditTrigger **"Edit owner"**.
- **"Created"**: `readOnly`, `defaultValue="2026-11-23"`, EditTrigger **"Edit created"**.

Checks:

1. "Subtitle"'s Preview shows "Add a subtitle" with `data-placeholder`; the Root, the Area and
   the Preview have `data-empty`; "Edit subtitle" edits an Input with `placeholder="Add a
   subtitle"` and `maxlength="12"`; typing `A very long subtitle` keeps 12 characters (`A very
   long `).
2. "Owner": its Preview has no `tabindex`; "Edit owner" is disabled; every part carries
   `data-disabled`.
3. "Created": its Preview has no `tabindex`; "Edit created" is disabled; a click and a double
   click on the Preview do not edit; the parts carry `data-readonly`.

### `/editable/field`

A `<form>` with a `Field.Root`: a `Field.Label` **"Project name"**, a Root `required`,
`name="project"`, no default, `placeholder="Name your project"`, an EditTrigger **"Edit project
name"**, a `Field.Description` **"Shown on the dashboard."**, a `Field.Error` **"Enter a project
name."**; buttons **"Submit"** and **"Reset"**. Output: `form: ...`.

Checks:

1. "Submit" submits nothing (`form: none`), focuses the Preview, which starts an edit: the
   `textbox` "Project name" is focused, described by "Shown on the dashboard.", required,
   `aria-invalid="true"`, and the error is shown.
2. Typing `Atlas` and Enter commits; the error is hidden; "Submit" submits `form: project=Atlas`.
3. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no Editable. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The value while editing | it follows the Input (`onValueChange` per keystroke), `onValueCommit` and `onValueRevert` end the edit | Zag's, and the Issue's three callbacks; a Field sees what the user types |
| The default modes | `activationMode` `"focus"`, `submitMode` `"both"` | Zag's defaults |
| The Preview's focus | `tabindex="0"` in `"focus"` mode, `"-1"` otherwise | Zag's Preview is always a tab stop; one that does nothing on focus would be a dead tab stop (the EditTrigger is the keyboard way), but it takes the focus back after an edit |
| Enter on the Preview | starts an edit | a Preview that took the focus back must lead into an edit again (Zag has none) |
| The focus return | the EditTrigger, else the Preview, without a new edit; not moved when the focus went elsewhere | Zag returns to the EditTrigger (or `finalFocusEl`) unless the focus went to a focusable element; the Preview fallback keeps the focus in the component |
| `edit`, `defaultEdit`, `onEditChange`, `selectOnFocus`, `autoResize`, `finalFocusEl`, a Label part | not offered | the Issue's API; the text is always selected (Zag's default); the Field's Label names the Input |
| A textarea's commit | Ctrl+Enter, or Meta+Enter | Zag's Apple-only Meta; both work everywhere here (a key is not a platform test) |
