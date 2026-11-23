# TagsInput

## Purpose

A text input that turns what the user types into a list of tags: email recipients, keywords,
labels. Enter (or a delimiter, or a paste) adds the typed text as a tag; the tags are shown before
the input, can be reached with the arrow keys and Backspace, removed, and edited in place. It is a
form control: it submits one value per tag, resets and validates, alone or in a
[Field](field.md).

It does not suggest tags: a list of suggestions is a [Combobox](combobox.md) or an
[Autocomplete](autocomplete.md) the app combines with it (an example, not a part). It is not a
group of tags to choose from (that is [TagGroup](tag-group.md)).

**Scope: stage 4** (Epic #91, Issue #89). The APG has no tags input pattern and Base UI has no
TagsInput: the behaviour references are Zag/Ark's and Reka UI's TagsInput (read, never copied),
and where they differ the APG-closest option is decided here (D4) and recorded in
`docs/decisions.md` ("Tags and choices"):

- the **Input is a native text input** and the field's labelled control (the APG's textbox; a
  `<label for>` names it);
- the **tags take DOM focus** (`tabindex="-1"`, out of the tab order), as Combobox's chips: the
  arrows and Backspace move the real focus to a tag, so a screen reader reads the tag it is on
  (Zag and Reka keep the focus in the input and only highlight a tag);
- the tags have **no role**: they are the app's text (a Tag's content) with a remove button, as
  Combobox's chips, Zag's and Reka's tags; an `option`, `row` or `listitem` would need a container
  of that role, which cannot also hold the Input. The primitives name nothing (no
  `aria-label` of their own, rule 7);
- the values are **strings**, submitted as one `type="hidden"` input per tag, as Listbox's
  multiple values.

Out of scope: suggestions (above), `readOnly`, a tag's own `disabled`, `maxLength`, Zag's
`addOnPaste` for text with no delimiter, a regular expression as the delimiter, and drag and drop
(`@fragiola/dnd`).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `tags-input-root` | holds the state; renders the hidden inputs as its last children |
| Control | `div` | `tags-input-control` | holds the tags and the Input; a press on it focuses the Input |
| Input | `input` | `tags-input-input` | the text the next tag is typed in; the labelled control |
| Tag | `div` | `tags-input-tag` | one per value, in value order; focusable (`tabindex="-1"`) |
| TagText | `span` | `tags-input-tag-text` | inside a Tag: its text (the consumer's children) |
| TagRemove | `button` | `tags-input-tag-remove` | inside a Tag: removes it |
| TagInput | `input` | `tags-input-tag-input` | inside a Tag: edits it in place (`editable`); `hidden` until then |
| ClearTrigger | `button` | `tags-input-clear-trigger` | removes every tag and the text |
| (hidden input) | `input` | `tags-input-hidden-input` | rendered by the Root: one per tag, plus the validation input |

One entry, `/tags-input` (D8), built on no other component; a Field control
(`ENTRY_DEPENDENCIES`: `field`). Its keys are the toolkit's `/collection`
(`tagsInputInputKeyTarget`, `tagsInputTagKeyTarget`) and the rules that add and edit a tag
`/form` (`takeTags`, `editTag`), with the form bridge.

The app renders one Tag per value: `index` is its position in the value. An uncontrolled
TagsInput gives the value to its children (React: the Root's `children` as a function of
`{ value }`; Vue: the Root's default scoped slot; Angular: the Root's `tags()` signal through
`exportAs`, `#tags="tagsInputRoot"`), so its Tags follow it.

## API

**Root**:

- `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the tags, an array of strings
  in order. Reasons: `keyboard` (Enter added a tag or ended an edit, Backspace or Delete removed
  one), `input-change` (a typed delimiter added tags), `input-paste` (a paste added tags),
  `input-blur` (`blurBehavior="add"`, or an edit ended by leaving it), `chip-remove-press` (a
  TagRemove), `clear-press` (the ClearTrigger), `none` (a form reset).
- `inputValue`, `defaultInputValue` (`""`), `onInputValueChange(text, details)`: the Input's text
  (controlled or not). Reasons: `input-change` (typing; a delimiter that added a tag), and the
  reasons above when adding, a blur or a clear changed it.
- `onValueInvalid(text, details)`: a text was refused as a tag; `details` adds `cause`:
  `"duplicate"`, `"max"` or `"invalid"` (below).
- `delimiter` (`","`): the character (or string) that ends a tag while typing and splits a
  paste; `null` for none (only Enter adds).
- `max` (`Infinity`): the most tags; a text offered past it is refused (`cause: "max"`).
- `allowDuplicates` (`false`): a text equal to a tag (after trimming, case-sensitive) is refused
  (`cause: "duplicate"`) unless `true`.
- `validate(tag, value)`: returns `false` to refuse a trimmed text (`cause: "invalid"`); `value`
  is the tags it would join (an edited tag's own value left out). Default: every text is valid.
- `blurBehavior`: what leaving the TagsInput (the focus moves outside the Root) does with the
  Input's text: `"add"` offers it as tags (reason `input-blur`), `"clear"` empties it; default
  (`undefined`): the text stays.
- `editable` (`false`): Enter and a double press on a Tag edit it in its TagInput.
- `disabled` (`false`), `name`, `required` (the form's validation fails while there is no tag).

**Tag**: `index` (number, required): its position in the value.

**TagText**, **TagRemove**, **TagInput**, **Control**, **Input**, **ClearTrigger**: nothing
beyond the contract.

### Adding tags

A text **offered** as tags (Enter, a delimiter, a paste, a blur) is split by the `delimiter` and
each part is trimmed; an empty part is dropped silently. Each part, in order, is added at the end
unless it is refused, checked against the tags so far (the parts added before it included): a
duplicate (unless `allowDuplicates`), past `max`, or `validate` returning `false`. Each refusal is
reported (`onValueInvalid(part, { reason, event, cause })`). The Input then holds the refused parts
joined by the delimiter (nothing when every part was added) and, when typing, the text after the
last delimiter (`takeTags` in `/form`, the toolkit's rule). One `onValueChange` reports every part
added by one action.

- **Enter** in the Input offers its whole text and keeps the form from submitting; with an empty
  (or blank) text it does nothing, so the form submits as from any text input.
- **A typed delimiter**: when an input typed the delimiter (the text it inserted holds it, or the
  Input's text holds it more times than before: `typesDelimiter` in `/form`), the parts before
  the last delimiter are offered, and the text after it stays, untrimmed. Any other input (a
  character, a deletion) only changes the text, even when the text holds the delimiter: the
  refused parts left in the Input are offered again only by the next typed delimiter, Enter, a
  paste with the delimiter or a blur, never by every keystroke (nor added silently once they
  would be accepted, after a tag was removed).
- **A paste** whose text holds the delimiter is not pasted: the Input's text with the pasted text
  in place of its selection is offered whole (reason `input-paste`). A paste with no delimiter is
  an ordinary paste.
- **Leaving** with `blurBehavior="add"` offers the whole text (reason `input-blur`).

### Editing a tag

With `editable`, Enter on a focused Tag (or a double press on it) shows its TagInput (the TagText
and TagRemove get `hidden`), with the tag's text, focused and selected. In the TagInput:

- **Enter** ends the edit: the trimmed text replaces the tag (`onValueChange`, reason `keyboard`)
  and the Tag is focused; an unchanged text changes nothing; an empty text removes the tag (focus
  as Delete, "Keyboard"); a refused text (a duplicate of another tag, or `validate`) is reported
  and the edit goes on.
- **Escape** drops the edit; the Tag is focused.
- **Leaving it** ends the edit as Enter does (reason `input-blur`), without moving the focus; a
  refused text is reported and dropped.
- **A double press inside it** (it bubbles to its Tag) is the TagInput's own (it selects a word):
  a double press on the Tag being edited does not start its edit again, so the typed text stays.

**An edit follows its tag.** While a tag is edited, a removal of another tag (a TagRemove press:
its `mousedown` is prevented, so the TagInput keeps the focus until the press moves it to the
Input) moves the edit with its tag: removing a tag before it moves the edit down by one, with its
typed text; removing a tag after it leaves it. Removing the edited tag itself ends its edit. The
edit then ends, as any, by its own rules: the press focuses the Input, so the TagInput's blur ends
it on its tag (reason `input-blur`).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-empty` (no tag); in a Field, the field's state attributes |
| Control | `data-disabled`, `data-empty` |
| Input | an `id` (the consumer's, else its own), `disabled`, `aria-required="true"` when required; in a Field, `aria-labelledby`, `aria-describedby`, `aria-invalid` |
| Tag | `tabindex="-1"` (none when disabled), `data-disabled`, `data-editing` while its TagInput edits it |
| TagText | `hidden` while its Tag is edited |
| TagRemove | `type="button"`, `tabindex="-1"`, `disabled` and `data-disabled` when disabled, `hidden` while its Tag is edited |
| TagInput | `tabindex="-1"`, `hidden` unless its Tag is edited, `disabled` when disabled |
| ClearTrigger | `type="button"`, `hidden` while there is no tag and no text, `disabled` and `data-disabled` when disabled |
| hidden inputs | see "Forms" |

The Input is named by a `<label for>` (or a `Field.Label`), or the consumer's `aria-label`; the
TagRemove, TagInput and ClearTrigger by the consumer's `aria-label`.

## Keyboard

"Previous" is ArrowLeft (ArrowRight in RTL), "next" ArrowRight (ArrowLeft in RTL). A key with
Ctrl, Meta or Alt does nothing of the TagsInput's; nor does a key during a text composition (an
IME).

**In the Input** ("at the start": the caret at 0 with no text selected):

| key | action |
| --- | --- |
| Enter | offers the text ("Adding tags"); nothing with an empty text |
| Backspace, at the start | focuses the last tag (it does not remove it) |
| previous, at the start | focuses the last tag |
| the delimiter | ends the tag ("Adding tags") |

**On a focused Tag**:

| key | action |
| --- | --- |
| previous | focuses the previous tag; on the first, nothing |
| next | focuses the next tag; on the last, the Input |
| Backspace | removes it (reason `keyboard`); focuses the previous tag, else the tag now at its place, else the Input |
| Delete | removes it (reason `keyboard`); focuses the tag now at its place, else the previous one, else the Input |
| Enter | `editable`: edits it ("Editing a tag") |
| Escape | focuses the Input |
| a printable character | focuses the Input, which receives the character |
| Tab | the browser's: the next tabbable element, the Input |

So Backspace at the start of the Input focuses the last tag, and a second Backspace removes it
(and focuses the one before it).

## Focus

The Input is the only tab stop (with the ClearTrigger, a native button). The tags take focus from
the keys above and a press. A TagRemove or the ClearTrigger press leaves the focus in (or moves
it to) the Input; their `mousedown` is prevented, so a press never focuses the TagRemove.

## Pointer

- A press on the Control itself (not on a tag nor the Input) focuses the Input.
- A press on a Tag focuses it; a double press edits it (`editable`).
- A press on a TagRemove removes its tag (reason `chip-remove-press`) and focuses the Input.
- A press on the ClearTrigger removes every tag and empties the text (reason `clear-press`), and
  focuses the Input.

## Forms

The Root renders, as its last children (spec/README.md, "Forms"), as Listbox's multiple list:

- one `type="hidden"` input per tag, with the `name`, in value order (with a `name` only);
- one visually hidden input with no `name` (`aria-hidden="true"`, `tabindex="-1"`) that carries
  `required` while there is no tag, so the browser validates it.

Each carries `data-primitives-part="tags-input-hidden-input"` and `disabled` when disabled. The
Input carries no `name`: its text is not submitted. A form reset returns the tags and the text to
`defaultValue` and `defaultInputValue` (reason `none`) and ends an edit. When the browser's
validation finds it invalid, the Input is focused.

**In a Field** ([field.md](field.md#integration-contract)): the Input is the labelable element
(`Field.Label` `for` its id) and carries `aria-labelledby`, `aria-describedby` and
`aria-invalid`; the Root carries the field's states; focus and blur are the focus entering and
leaving the Root; `validate` gets the tags; the validated element is the visually hidden input;
the field's `name` and `disabled` win.

## RTL

The previous and next arrows swap (the direction provider, else the computed direction of the
element the key is on); "at the start" stays the caret at 0.

## Scenarios

Output values print a list as its values joined with `,`, and `none` for `[]` or an empty text.
Each Tag holds a TagText with the tag, then a TagRemove `aria-label` **"Remove <tag>"** (text
"×"); the tests find a tag by its TagText's text and focus its Tag (the TagText's parent).

### `/tags-input/basic`

A `<label for="tags">` **"Tags"**; an uncontrolled Root with `defaultValue` `["react", "vue"]`:
a Control holding the Tags (the Root's children function) and the Input (`id="tags"`), then a
ClearTrigger `aria-label` **"Clear tags"** (text "×"); then a button **"After"**. Output:
`value: ...` and `reason: ...` (the last `onValueChange`), `invalid: <cause>` (the last
`onValueInvalid`, `none` before any).

Checks:

1. A `textbox` named "Tags"; the tags "react" and "vue"; buttons "Remove react", "Remove vue" and
   "Clear tags"; no hidden input in the accessibility tree. Tab from the page start focuses the
   textbox (the tags are not in the tab order).
2. Typing "angular" and Enter adds it (`value: react,vue,angular`, `reason: keyboard`) and empties
   the textbox; Enter in the empty textbox changes nothing.
3. Typing "svelte," adds "svelte" (`value: react,vue,angular,svelte`, `reason: input-change`) and
   empties the textbox; typing " solid ,qwik" adds "solid" and leaves "qwik" in the textbox.
4. Emptying the textbox, typing " react " and Enter is refused (`invalid: duplicate`, the value
   unchanged) and leaves "react" in the textbox.
5. Backspace in the empty textbox focuses the tag "vue" and removes nothing; Backspace removes
   it (`value: react`, `reason: keyboard`) and focuses "react"; Backspace removes "react"
   (`value: none`) and focuses the textbox (no tag is left). With the text "ab" (the caret at
   the end), Backspace erases "b" and the focus stays in the textbox.
6. From the empty textbox: ArrowLeft focuses "vue", ArrowLeft "react", ArrowLeft again stays on
   "react" (the first), ArrowRight focuses "vue", ArrowRight on the last tag the textbox.
7. Delete on "react" removes it (`value: vue`) and focuses "vue" (now at its place); typing "x"
   on "vue" focuses the textbox, which holds "x".
8. A click on "Remove react" removes it (`value: vue`, `reason: chip-remove-press`) and focuses
   the textbox.
9. A click on "Clear tags" removes every tag and the text (`value: none`, `reason: clear-press`),
   focuses the textbox, and the ClearTrigger is hidden.
10. Axe finds no violation, with tags and empty.
11. On a new page: filling the textbox with "react,vue" (one input) and Enter refuses both (`invalid: duplicate`) and leaves
    "react,vue" in the textbox; a click on "Remove react" (`value: vue`); End and typing "x" only
    changes the text ("react,vuex"; `value: vue`, `reason: chip-remove-press`: the refused
    "react" is not offered by a character); typing "," offers both (`value: vue,react,vuex`,
    `reason: input-change`) and empties the textbox.

### `/tags-input/basic?dir=rtl`

The same page right to left. Checks: from the empty textbox, ArrowRight focuses "vue",
ArrowRight "react", ArrowLeft "vue", ArrowLeft the textbox; Backspace from the empty textbox
focuses "vue".

### `/tags-input/options`

A `<label for="emails">` **"Emails"**; a Root with `delimiter` `";"`, `max` `3`, and `validate`
accepting a text with an `@`; uncontrolled, no tag. Output: `value: ...`, `reason: ...`,
`invalid: <cause> <text>` (the last refusal's cause and text).

Checks:

1. Typing "ada@example.com;" adds it (`value: ada@example.com`); typing "a,b" leaves "a,b" in the
   textbox (a comma is no delimiter here); Enter is refused (`invalid: invalid a,b`).
2. Emptying the textbox and pasting "bob@example.com; cy@example.com; dee@example.com" adds
   "bob@example.com" and "cy@example.com" (`value: ada@example.com,bob@example.com,cy@example.com`,
   `reason: input-paste`) and refuses "dee@example.com" (`invalid: max dee@example.com`), which
   stays in the textbox.
3. Axe finds no violation.

### `/tags-input/edit`

A `<label for="edit-tags">` **"Tags"**; an `editable` Root with `defaultValue`
`["one", "two", "three"]`; each Tag also holds a TagInput `aria-label` **"Edit tag"**; then a
button **"After"**. Output: `value: ...`, `reason: ...`, `invalid: <cause>`.

Checks:

1. No textbox "Edit tag" is shown. A click on "two" focuses it; Enter shows the textbox "Edit tag"
   focused, holding "two" all selected, and hides the tag's text and remove button; typing
   "deux" and Enter replaces it (`value: one,deux,three`, `reason: keyboard`) and focuses the
   tag "deux".
2. A double click on "one" edits it; Escape drops the edit ("one" kept) and focuses the tag
   "one".
3. Editing "three" to "one" and Enter is refused (`invalid: duplicate`) and the edit goes on;
   Escape.
4. Editing "deux" to "" and Enter removes it (`value: one,three`) and focuses "three".
5. Editing "one" to "uno" and a click on "After" ends the edit (`value: uno,three`,
   `reason: input-blur`).
6. Axe finds no violation while editing.
7. On a new page: a double click on "one", typing "uno", and a double click in the textbox
   "Edit tag" keeps "uno" in it (focused); End and Enter give `value: uno,two,three`.
8. On a new page: editing "two" to "deux" (a click on "two", Enter, typing) and a click on
   "Remove one" removes "one" and ends the edit on "deux", not on the tag now at its place
   (`value: deux,three`, `reason: input-blur`); no textbox "Edit tag" is shown, the textbox
   "Tags" is focused and the tag "three" is kept.

### `/tags-input/blur`

Three Roots, each with a `<label for>` and an Input, no ClearTrigger: **"Add on blur"**
(`blurBehavior="add"`), **"Clear on blur"** (`blurBehavior="clear"`), **"Keep on blur"** (the
default); then a button **"After"**. Output: `add: ...` and `add-reason: ...` (the first's value
and reason), `clear: ...` (the second's value).

Checks:

1. Typing "draft" in "Add on blur" and Tab adds it (`add: draft`, `add-reason: input-blur`) and
   empties the textbox.
2. Typing "draft" in "Clear on blur" and Tab adds nothing (`clear: none`) and empties the
   textbox.
3. Typing "draft" in "Keep on blur" and Tab keeps "draft" in it.

### `/tags-input/field`

A `<form>` with:

- a `Field.Root` `name="tags"`: a `Field.Label` **"Tags"**, a `required` Root (Control, Tags,
  Input), a `Field.Description` **"Press Enter to add a tag."**, a `Field.Error`
  **"Add at least one tag."**;
- a `<label for="labels">` **"Labels"** and a Root `name="labels"` with `defaultValue` `["bug"]`;
- a **"Submit"** and a **"Reset"** button.

Output: `form: ...` (the submitted entries, `none` when the submission was blocked).

Checks:

1. A `textbox` named "Tags", described by "Press Enter to add a tag.", not `aria-invalid`; no
   hidden input in the accessibility tree.
2. "Submit" submits nothing (`form: none`), focuses the "Tags" textbox, makes it
   `aria-invalid="true"` and shows "Add at least one tag.".
3. Typing "alpha" and Enter adds it (no submission) and hides the error; Enter again in the empty
   textbox submits the form: `form: tags=alpha&labels=bug`.
4. Adding "beta" to "Labels" and "Submit" give `form: tags=alpha&labels=bug&labels=beta`.
5. Typing "draft" in "Labels", then "Reset" returns both to their defaults (no tag in "Tags",
   "bug" alone in "Labels", an empty text); "Submit" submits nothing again.
6. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI has no TagsInput. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| Focus on the tags | DOM focus (`tabindex="-1"`) | a screen reader reads the focused tag; Combobox's chips do the same (Zag and Reka highlight a tag while the input keeps the focus) |
| Tags' role | none | a container role (`listbox`, `grid`, `list`) could not also hold the Input; Zag's, Reka's and Combobox's chips have none |
| Backspace on a tag | removes it and focuses the previous tag | repeated Backspace removes the tags from the end, as in a text; Delete moves forward (Zag) |
| Enter with an empty text | not handled: the form submits | a text input's implicit submission (Zag always prevents it) |
| A paste with no delimiter | an ordinary paste | Zag's `addOnPaste` is off by default; a paste with the delimiter is a list |
| A refused text | stays in the Input (trimmed), reported by `onValueInvalid` | the user corrects it instead of retyping it (Zag keeps it too) |
| `blurBehavior` | `"add"`, `"clear"`, or keep (the default) | Zag's options; keeping the text loses nothing |
| Editing | opt-in (`editable`), Enter or a double press | Zag's (on by default there); an empty edit removes the tag (Zag) |
| The value | strings | a form submits strings (Listbox's, RadioGroup's hidden inputs) |
