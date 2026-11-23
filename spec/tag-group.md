# TagGroup

## Purpose

A focusable group of tags that stays on the page: labels, categories, keywords or filters, which
the user moves through with the arrow keys, may select (none, one or several) and may remove. The
app owns the tags: it renders one Tag per entry and removes the entry when `onRemove` asks for it.

It is not a text input that creates tags (that is [TagsInput](tags-input.md)), nor a list of
options to submit with a form (a [Listbox](listbox.md)): a TagGroup has no hidden input and no
value of its own in a form.

**Scope: stage 4** (Epic #91, Issue #89). The APG has no tag pattern and Base UI has no TagGroup:
the APG-closest behaviour is decided here (D4, the Epic's stop condition) and recorded in
`docs/decisions.md` ("Tags and choices"). It is React Aria's TagGroup (read, never copied), which
builds on the APG **grid** pattern:

- the List is a `grid` whose Tags are `row`s, each holding one `gridcell`: a row can hold a
  remove button, which an `option` or a `listitem` with `aria-selected` cannot (an option's
  children are presentational; `aria-selected` is not allowed on a list item);
- one tab stop (the APG's roving `tabindex`), the arrows move between the tags, Home and End go
  to the ends (the APG grid's keys, in a single wrapping line of tags);
- the selection follows the APG's recommended model for a multi-select composite ("toggle": Space
  and Enter toggle, a move never selects), on the toolkit's `/selection`, as Listbox;
- Delete and Backspace remove the focused tag, and a removal moves the focus to the next tag, else
  the previous one, else the List (React Aria).

Out of scope: Escape clearing the selection, Shift ranges and select all, typeahead, links in
tags (`href`), `onAction`, drag and drop (`@fragiola/dnd`), the live region React Aria adds
while the focus is inside (`aria-live`), and a built-in empty-state part (the app renders its own
message, "Empty state").

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `tag-group-root` | holds the state; no role |
| Label | `span` | `tag-group-label` | names the List (outside a [Field](field.md)) |
| List | `div` | `tag-group-list` | the `grid` (a `group` while it holds no tag) |
| Tag | `div` | `tag-group-tag` | a `row`, focusable (roving `tabindex`) |
| TagCell | `div` | `tag-group-tag-cell` | the Tag's one `gridcell`: holds its content and its RemoveButton |
| RemoveButton | `button` | `tag-group-remove-button` | inside a TagCell: removes its Tag |

One entry, `/tag-group` (D8), built on no other component; a Field control
(`ENTRY_DEPENDENCIES`: `field`). Its key map is the toolkit's `/collection` (`tagGroupKeyTarget`,
`removalFocusIndex`) and its selection rules `/selection` (`applySelection`, `createListModel`,
`listPressSelection`), as Listbox's.

The TagCell is a part of its own, not an element the Tag renders: an Angular part is a directive
on the consumer's element and renders no element inside it, and every framework renders the same
DOM (`docs/decisions.md`). Every Tag holds exactly one TagCell, around all of its content.

## API

**Root**:

- `selectionMode` (`"none"`): `"none"`, `"single"` or `"multiple"`.
- `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the selected tags' `value`s,
  an array in every mode (one value at most in `"single"`), in the tags' order (values no rendered
  tag has stay at the end). Reasons: `item-press` (a press), `keyboard` (Space, Enter).
- `disabledKeys` (`[]`): the `value`s of the disabled tags (as a Tag's `disabled`).
- `disabled` (`false`): every tag is disabled.
- `onRemove(value, details)`: a tag asks to be removed: the app removes it (synchronously, in the
  handler) or keeps it. Reasons: `keyboard` (Delete, Backspace), `chip-remove-press` (its
  RemoveButton). Without `onRemove`, no tag is removable: the keys do nothing and a RemoveButton
  press reports nothing.
  Vue: a `remove` listener (`@remove`) makes the tags removable. Angular, which cannot tell
  whether an output is bound: the `removable` input (`false`) together with the `(remove)` output.
- `loopFocus` (`true`): the arrows wrap from the last tag to the first and back.

A removal does not change the selection: an app that removes a selected tag updates `value` too
(a value no rendered tag has stays at the end, as said above).

**Tag**: `value` (string, required, unique in the group), `disabled` (`false`).

**Label**, **List**, **TagCell**, **RemoveButton**: nothing beyond the contract.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-disabled`, `data-empty` (no tag, once mounted); in a Field, nothing more |
| Label | an `id` (its own unless the consumer gives one) |
| List | `role="grid"`, or `role="group"` while it holds no tag (once mounted: a `grid` needs rows, React Aria); `aria-labelledby` (the Label's id; in a Field, the `Field.Label`'s); `aria-multiselectable="true"` with `"multiple"` (a `grid` only); `data-empty`, and `tabindex="-1"` while empty (it takes the focus after the last removal); `data-disabled`; in a Field, `aria-describedby`, `aria-invalid` and the field's state attributes |
| Tag | `role="row"`; `tabindex` (`0` on the tab stop, `-1` on the others, none when disabled); `aria-selected` (`"true"` or `"false"`, on every tag, unless `selectionMode="none"`); `aria-disabled="true"` and `data-disabled` when disabled; `data-selected` |
| TagCell | `role="gridcell"` |
| RemoveButton | `type="button"`, `tabindex="-1"`, `disabled` and `data-disabled` when its Tag is disabled |

The List's accessible name comes from the Label, a `Field.Label`, or the consumer's
`aria-labelledby` / `aria-label` (which win). A Tag's name is its content (the RemoveButton's name
included); the RemoveButton's name is the consumer's (`aria-label`): primitives name nothing.

## Keyboard

DOM focus moves to the tags (roving `tabindex`). Disabled tags never take focus: the arrows, Home
and End pass over them (React Aria's default; the APG lets a grid skip them). "Next" is ArrowRight
(ArrowLeft in RTL) and ArrowDown; "previous" is ArrowLeft (ArrowRight in RTL) and ArrowUp: the
tags are one wrapping line, read in order.

| key | action |
| --- | --- |
| Tab into the List | focuses the tab stop: the tag that last had focus, else the first enabled tag |
| next / previous | focus the next / previous enabled tag (wrapping with `loopFocus`) |
| Home / End | focus the first / last enabled tag |
| Space, Enter | `"single"`: selects the focused tag (the selected one stays selected); `"multiple"`: toggles it; `"none"`: nothing |
| Delete, Backspace | `onRemove(value, { reason: "keyboard" })` for the focused tag (with `onRemove`) |
| Tab | leaves the List |

A key with Ctrl, Meta, Alt or Shift does nothing (Shift+Tab leaves the List).

## Focus

- The tab stop is the tag that last had focus while it is rendered and enabled, else the first
  enabled tag (the APG's roving `tabindex`: a composite remembers its focus). A List with no
  enabled tag has no tab stop. Before the tags are known (a server render, the first render),
  every tag has `tabindex="-1"`, as Listbox's options; once mounted, the tab stop is computed.
- **A removal** (a key or a RemoveButton press): once `onRemove` returns, if the tag is still
  rendered (the app kept it) it is focused; otherwise the focus moves to the next enabled tag
  after it, else the last enabled tag before it, else the List (`role="group"`, `tabindex="-1"`).
  The tags are the ones rendered before the removal that are still in the document.
- A RemoveButton never takes the focus from a press (its `mousedown` is prevented).

## Pointer

A press on an enabled Tag focuses it and selects it (`"single"`) or toggles it (`"multiple"`),
reason `item-press`; modifiers change nothing. A press on a disabled Tag does nothing. A press on
a RemoveButton removes its Tag (reason `chip-remove-press`) and selects nothing.

## Empty state

`data-empty` on the Root and the List while no Tag is rendered (once mounted: a server render
knows no tag, so it never says "empty"). The List is then a `group` with `tabindex="-1"`; no Tab
stops in it. The app renders its empty message itself, outside the List (a `grid` or a `group`
of the TagGroup holds tags only), for example in the Root.

## Forms

None: a TagGroup has no `name` and no hidden input (React Aria's has none either); the selection
is the app's. **In a Field** ([field.md](field.md#integration-contract)): the List is the field's
control (as Listbox's Root), named by the `Field.Label` (`aria-labelledby`), described by the
field (`aria-describedby`), `aria-invalid` and the field's states on it; focus and blur are the
focus entering and leaving the List; `validate` gets the selected values; there is no validated
element. The field's `disabled` disables every tag. Its focus target (the element a
[Form](form.md) focuses when the field is the first invalid one) is the tab stop ("Focus"): a tag
disabled by `disabledKeys` is never it, and a group with no enabled tag (every tag disabled, the
Root's or the field's `disabled`) has none.

## RTL

ArrowLeft and ArrowRight swap (the direction provider, else the List's computed direction);
ArrowUp and ArrowDown do not change.

## Scenarios

The tags: **News** (`news`), **Travel** (`travel`), **Gaming** (`gaming`), **Shopping**
(`shopping`), **Sports** (`sports`). Each Tag holds a TagCell with the tag's name and, where the
scenario says so, a RemoveButton with `aria-label` **"Remove <name>"** and the text "×". A Tag's
accessible name is then "<name> Remove <name>": the tests match it from its start. Output values
print a list as its values joined with `,`, and `none` for `[]`.

### `/tag-group/basic`

A Root with a Label **"Categories"** and a List of the five tags, each with its RemoveButton;
`selectionMode` `"none"`. The fixture holds the tags and removes the one `onRemove` names. Then a
button **"After"**. While the fixture has no tag, it renders the paragraph **"No categories."**
inside the Root, after the List. Output: `tags: ...` (the rendered tags), `removed: ...` (the last
`onRemove` value), `reason: ...` (its reason).

Checks:

1. A `grid` named "Categories" without `aria-multiselectable`; five `row`s, none with
   `aria-selected`; each holds one `gridcell`; five buttons "Remove …".
2. Tab from the page start focuses "News"; ArrowRight focuses "Travel", ArrowLeft "News";
   ArrowLeft wraps to "Sports", ArrowRight wraps to "News"; ArrowDown focuses "Travel", ArrowUp
   "News"; End focuses "Sports", Home "News". Space and Enter select nothing.
3. ArrowRight to "Travel", Tab moves to "After", Shift+Tab returns to "Travel" (the last
   focused).
4. Delete on "Travel" removes it (`tags: news,gaming,shopping,sports`, `removed: travel`,
   `reason: keyboard`) and focuses "Gaming" (the next). End, then Backspace on "Sports" removes it
   (`tags: news,gaming,shopping`) and focuses "Shopping" (there is no next).
5. From the page's start, a click on "Remove News" removes it
   (`tags: travel,gaming,shopping,sports`, `reason: chip-remove-press`), focuses "Travel" and
   selects nothing.
6. From "News", Delete five times removes every tag, focusing "Travel", "Gaming", "Shopping" and
   "Sports" in turn; after the last one (`tags: none`) no `grid` is left: the List is a `group`
   named "Categories" that has the focus, with `data-empty` (contract), and "No categories." is
   shown; Tab moves to "After".
7. Axe finds no violation, with tags and empty.

### `/tag-group/basic?dir=rtl`

The same page right to left. Checks: Tab focuses "News"; ArrowLeft focuses "Travel"; ArrowRight
focuses "News"; ArrowRight wraps to "Sports"; ArrowDown focuses "News".

### `/tag-group/selection`

A Root with a Label **"Interests"**, `selectionMode` `"multiple"`, the five tags without
RemoveButtons and no `onRemove`; the fixture holds `value`, starting `["gaming"]`. Output:
`value: ...`, `reason: ...`.

Checks:

1. A `grid` named "Interests" with `aria-multiselectable="true"`; every row has `aria-selected`;
   only "Gaming" is selected.
2. Tab focuses "News" (the first tag: the tab stop does not follow the selection); Space selects
   it (`value: news,gaming`, `reason: keyboard`); ArrowRight and Enter select "Travel"
   (`value: news,travel,gaming`); ArrowRight and Space unselect "Gaming" (`value: news,travel`).
3. From the page's start, a click on "Shopping" selects and focuses it
   (`value: gaming,shopping`, `reason: item-press`); a click on "Gaming" unselects it
   (`value: shopping`).
4. Delete and Backspace on "Shopping" remove nothing (no `onRemove`): five rows.
5. Axe finds no violation with tags selected.

### `/tag-group/single`

A Root with a Label **"Sort"**, `selectionMode` `"single"`, uncontrolled (no `defaultValue`), the
tags **Newest** (`newest`), **Oldest** (`oldest`), **Popular** (`popular`) without RemoveButtons.
Output: `value: ...` (the last `onValueChange` value, `none` before any).

Checks:

1. A `grid` named "Sort" without `aria-multiselectable`; three rows, none selected.
2. Tab focuses "Newest"; Space selects it (`value: newest`); ArrowRight and Space select
   "Oldest" alone (`value: oldest`); Space again keeps it (`value: oldest`, one selected row).
3. A click on "Popular" selects it alone (`value: popular`).

### `/tag-group/disabled`

A Root with a Label **"Categories"**, `selectionMode` `"multiple"`, `disabledKeys` `["travel"]`,
the five tags with RemoveButtons, **Sports** with `disabled`; the fixture removes the tag
`onRemove` names, as `/tag-group/basic`. Output: `tags: ...`, `value: ...`.

Checks:

1. "Travel" and "Sports" have `aria-disabled="true"` and no `tabindex`; their RemoveButtons are
   disabled.
2. Tab focuses "News"; ArrowRight focuses "Gaming" (passing over "Travel"); End focuses
   "Shopping" (the last enabled); ArrowRight wraps to "News"; ArrowLeft wraps to "Shopping".
3. A click on "Travel" selects nothing and does not focus it (`value: none`).
4. On "Gaming", Delete removes it and focuses "Shopping"; Delete removes "Shopping" and focuses
   "News" (no enabled tag after it: the last enabled one before it, passing over "Travel");
   `tags: news,travel,sports`.
5. Axe finds no violation.

### `/tag-group/empty`

A Root with a Label **"Categories"** and an empty List, then **"No categories."** in the Root,
and a button **"After"**. Checks: a `group` named "Categories" (no `grid`); Tab from the page
start focuses "After"; axe finds no violation.

### `/tag-group/field`

A `Field.Root` with a `Field.Label` **"Skills"**, a Root (no Label) with `selectionMode`
`"multiple"` and the tags **Design** (`design`), **Writing** (`writing`), **Research**
(`research`) without RemoveButtons, and a `Field.Description` **"Your strongest skills."**.
Output: `value: ...` (`none` before any change).

Checks:

1. A `grid` named "Skills", described by "Your strongest skills.", not `aria-invalid`.
2. Tab focuses "Design"; Space selects it (`value: design`).
3. Axe finds no violation.

### `/tag-group/form`

A `Form` with a `Field.Root` `name="skills"` whose `validate` refuses no selection
(**"Choose a skill."**): a `Field.Label` **"Skills"**, a Root with `selectionMode` `"multiple"`
and `disabledKeys` `["design"]` holding the tags of `/tag-group/field` without RemoveButtons, a
`Field.Error`; then a **"Submit"** button.

Checks:

1. "Submit" submits nothing, focuses "Writing" (the field's focus target is the tab stop, which
   passes over "Design", disabled by `disabledKeys`), makes the `grid` `aria-invalid="true"` and
   shows "Choose a skill.".
2. Axe finds no violation after the failed submission.

## Differences from Base UI and the references

Base UI has no TagGroup. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| Roles | a `grid` of `row`s with one `gridcell` each (`group` while empty) | React Aria's: a row may hold a remove button and carry `aria-selected` |
| The value | an array of strings in every mode | one shape for `"single"` and `"multiple"` (React Aria's `Set` of keys), in the tags' order as Listbox's |
| Single selection | Space, Enter and a press select; the selected tag stays selected | Listbox's rule (the toolkit's `applySelection`); `[]` returns through the controlled value |
| Disabled tags | skipped by the keys, never focused | React Aria's default (`disabledBehavior="all"`); a disabled tag has nothing to do (Listbox keeps the APG's focusable options, which carry a choice to discover) |
| Removing a selected tag | removes that tag only, the selection unchanged | React Aria removes every selected tag; one key, one tag is the rule the focus moves by |
| Focus after the last removal | the List | React Aria focuses its container; the List is the named element |
| The TagCell | a part the consumer renders | React Aria renders the cell itself; an Angular part cannot (Anatomy) |
| Escape, ranges, typeahead, `aria-live` | not offered | out of scope for this stage |
