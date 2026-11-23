# Autocomplete

## Purpose

A free-text input with a list of suggestions (the APG `combobox` with list autocomplete; Base UI
1.9's Autocomplete). **The value is the text**, not an item: a suggestion fills the input with
its text, and any other text is a value too. A search field, a tag or a city typed or completed.

It has Base UI's parts and names, with Combobox's behaviour where both share it (D10:
[combobox.md](combobox.md)): built-in filtering, the Escape rule, groups, the Empty live region,
the Field contract. Where the APG decides, the APG wins (D4): the inline completion of the
`both` and `inline` modes follows the APG's "list with inline autocomplete" example.

- **`mode`**: `list` (filter, the text unchanged by the highlight), `both` (filter and inline
  completion), `inline` (inline completion over a fixed list), `none` (a fixed list, the text
  unchanged): the four autocomplete behaviours of the APG, named as Base UI does.
- **Filtering** is Combobox's (`filter`, `limit`, `locale`, the toolkit's `filterItems` and
  `containsFilter`); `items` may change at any time (async suggestions).
- **Forms and Field**: the Input is the form control: its `name`, `required` and native
  validity.

Out of scope: virtualization, Base UI's `Row`, `Collection`, `Icon`, `Arrow` and `Backdrop`
parts, `inline` (a list with no popup), `keepHighlight`, `highlightItemOnHover`,
`submitOnItemClick`, `onItemHighlighted`, `autoHighlight="always"`, `readOnly`, an input inside
the popup, the `useFilter` / `useFilteredItems` hooks, and cancelable value changes.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state |
| InputGroup | `div` | `autocomplete-input-group` | optional; holds the Input and its buttons, and anchors the list |
| Input | `input` | `autocomplete-input` | the `combobox`; keeps DOM focus; the form control |
| Trigger | `button` | `autocomplete-trigger` | toggles the list; optional; not in the tab order |
| Clear | `button` | `autocomplete-clear` | clears the text; rendered only while there is text |
| Value | none | | renders the value: the text, or a render function of it |
| Status | `div` | `autocomplete-status` | a polite live region for the consumer's text |
| Portal | none | | |
| Positioner | `div` | `autocomplete-positioner` | anchored to the InputGroup, else the Input |
| Popup | `div` | `autocomplete-popup` | the floating container |
| Empty | `div` | `autocomplete-empty` | a polite live region; its children rendered only while the list is empty |
| List | `div` | `autocomplete-list` | the `listbox` |
| Group | `div` | `autocomplete-group` | a `group` of items |
| GroupLabel | `div` | `autocomplete-group-label` | names its Group |
| Separator | `div` | `autocomplete-separator` | between groups |
| Item | `div` | `autocomplete-item` | an `option` (a suggestion) |

## API

**Root**:

- `value`, `defaultValue` (`""`), `onValueChange(value, details)`: the text. Reasons:
  `input-change` (typing), `item-press` (a suggestion chosen, by a press or Enter),
  `input-blur` (an inline completion accepted when the focus leaves, `both` and `inline`),
  `clear-press`, `escape-key`, `none` (a form reset).
- `items`: the suggestions, or groups of them (`{ items, ... }[]`). With it, the Root filters
  them (in `list` and `both`) and the List renders the matching ones; without it, the consumer
  renders the Items. A new `items` array (suggestions loaded for the text) is used as it
  arrives: the list shows it, and a highlight whose item is gone is dropped.
- `mode` (`"list"`): `"list"`, `"both"`, `"inline"` or `"none"` (above). `inline` and `none`
  never filter.
- `filter(item, query, itemToString)`, `limit` (`-1`), `locale`: as Combobox's, the query being
  the typed text, trimmed.
- `itemToStringValue(item)`: a suggestion's text, written into the input when it is chosen and
  matched by the filter and the inline completion. Default: an object's `label`, else its
  `value`, else the item itself as a string (Combobox's `itemToStringLabel` default).
- `openOnInputClick` (`false`): a press on the Input opens the list (Base UI's default).
- `autoHighlight` (`false`): in `list` and `none`, typing highlights the first suggestion (the
  APG's "list autocomplete with automatic selection"); `both` and `inline` always do.
- `open`, `defaultOpen` (`false`), `onOpenChange(open, details)` (an `OpenChangeDetails`; its
  `trigger` is the Input), `onOpenChangeComplete(open)`, the actions (`close()`, `unmount()`).
- `name`, `required`, `disabled`: the Input's.

**List**, **Value**: `children` as Combobox's (a render function of each matching entry; of the
value); the framework mapping of [combobox.md](combobox.md#api) (Vue scoped slots, Angular
`entries()` / `value()` through `exportAs`).

**Item**: `value` (any, required: the suggestion), `disabled` (highlighted, never chosen).

**Portal**, **Positioner**: as Combobox's (`keepMounted`; `side="bottom" align="start"`,
`--anchor-width`).

**Clear**, **Trigger**: `disabled` comes from the Root.

### The query and the shown text

The Root keeps two texts: the **value** (what was typed or chosen, reported by
`onValueChange`) and the **shown text** (the Input's text). They differ only while a highlight
completes the input in `both` and `inline`: the Input shows the highlighted suggestion's text,
and the list stays filtered by the value. Choosing, typing, Escape and closing the list make the
shown text the value again. Nothing a highlight shows is reported until it is accepted.

### Inline completion (`both`, `inline`)

The APG's "list with inline autocomplete":

- Typing a character that **adds** to the text (not a deletion) highlights the first enabled
  suggestion whose text starts with the value (case-insensitive), and the Input shows the value
  followed by the rest of that suggestion's text, **selected** (the completion string), so the
  next character replaces it. With no such suggestion, nothing is highlighted and nothing is
  completed.
- A deletion (Backspace, Delete, cutting) removes the completion and highlights nothing.
- The arrow keys move the highlight; the Input shows the highlighted suggestion's whole text,
  the caret at its end. Back to the input (no highlight), it shows the value.
- Enter chooses the highlighted suggestion (`item-press`). Leaving the Input (Tab, an outside
  press) with a highlighted suggestion accepts it (`input-blur`, the APG: "the automatically
  selected suggestion becomes the value of the combobox when the combobox loses focus").
- Escape (open) closes the list and drops the completion: the Input shows the value.
- A pointer hovering a suggestion highlights it and completes nothing.

In `list` and `none`, the Input always shows the value.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| InputGroup | `role="group"`, `data-popup-open` while the list is open, `data-disabled` |
| Input | `role="combobox"`, `aria-autocomplete` (the `mode`: `list`, `both`, `inline`, `none`), `aria-expanded`, `aria-controls` (the List's id, while it exists), `aria-activedescendant` (the highlighted item's id, only while one is highlighted), `autocomplete="off"`, `name`, `required`, `disabled`, `data-popup-open` while the list is open, `data-disabled`; in a Field, the field's ids and states |
| Trigger | `tabindex="-1"`, `aria-expanded`, `aria-controls`, `data-popup-open`, `data-disabled` |
| Clear | `type="button"`, `tabindex="-1"`, `data-disabled` |
| Status, Empty | `role="status"`, `aria-live="polite"`, `aria-atomic="true"` |
| Positioner, Popup | as Combobox's: `data-open` / `data-closed`; the Positioner `hidden` while kept mounted and closed |
| List | `role="listbox"`, an `id`, `data-empty` when it holds no item |
| Group | `role="group"`, `aria-labelledby` (its GroupLabel) |
| GroupLabel | an `id` |
| Separator | `role="presentation"`, `data-orientation="horizontal"` |
| Item | `role="option"`, an `id`, `aria-disabled="true"` and `data-disabled` when disabled, `data-highlighted`; no `aria-selected` (a suggestion is never selected: the value is the text) |

The Input's accessible name comes from the consumer (`<label for>`, `aria-label`) or a
`Field.Label`; the Trigger and Clear are named by the consumer.

## Keyboard

DOM focus **stays on the Input**; the highlighted suggestion is announced through
`aria-activedescendant`.

| key | action |
| --- | --- |
| typing | changes the value (`input-change`) and filters; opens the list while the text is not empty (`input-change`); an empty text closes it unless `openOnInputClick` (`input-clear`). Highlights nothing, unless `autoHighlight`, or an addition in `both` / `inline` (the inline completion) |
| ArrowDown | closed: opens and highlights the first suggestion (`list-navigation`; APG); open: the next suggestion; from the last, back to the input (no highlight), as Combobox |
| ArrowUp | as ArrowDown, backwards: closed, opens on the last suggestion |
| Alt+ArrowDown / Alt+ArrowUp | opens without highlighting / closes |
| Home / End | move the caret (native), never the highlight |
| Enter | open with a highlighted enabled suggestion: chooses it (its text becomes the value, `item-press`), closes the list, and the form is not submitted; open with no highlight: closes the list (`none`) and lets the form submit; closed: the form submits |
| Escape | open: closes the list (`escape-key`), the text kept (the completion dropped); closed: clears the text (`escape-key`) |
| Tab | closes the list (`focus-out`) and moves on; in `both` / `inline` a highlighted suggestion is accepted first |

Disabled suggestions can be highlighted (Combobox's rule) but never chosen, nor completed inline.

## Pointer

- A press on the Input opens the list only with `openOnInputClick` (`input-press`).
- A press on the Trigger toggles the list and keeps the focus in the Input (`trigger-press`).
- A press on Clear empties the text (`clear-press`), keeps the focus in the Input and closes the
  list (`input-clear`) unless `openOnInputClick`.
- Hovering a suggestion highlights it; a click on an enabled one chooses it (`item-press`) and
  closes the list.
- A press outside the Input, the InputGroup, the Trigger and the Popup closes the list
  (`outside-press`), keeping the value (in `both` / `inline` a highlighted suggestion is accepted,
  `input-blur`).

## Forms

The Input is the form control (Base UI: the input owns the form value): it carries `name`,
`required` and `disabled`, submits the shown text, and is the element the browser validates.
There is no hidden input. A form reset returns an uncontrolled autocomplete to its `defaultValue`
(`none`) and closes the list.

**In a Field** ([field.md](field.md#integration-contract)): the Input is the labelable element
(`id`, `for`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, the field's states) and the
validated element; `validate` gets the value (the text); the field's `name` and `disabled` win.

## Dismissal, layering, positioning, animation

As Combobox's: the open list is a layer (inside a Dialog, Escape closes the list first),
positioned as [popover.md](popover.md#positioning) on the InputGroup, else the Input, with
Popover's animation and lifecycle.

## RTL

The list follows the input's direction for `align`; no key changes.

## Shared with Combobox

Autocomplete and Combobox are separate entries (D8), neither built on the other
(`ENTRY_DEPENDENCIES`: both on Field only). What they share is each framework's shared code
(React `hooks/`, Vue `composables/`, Angular `/internal`: the overlay root, the positioner, the
presence, the Field binding) and the toolkit (`/collection`'s `filterItems`, `containsFilter`,
`itemLabel`, `stepThroughNone`, `scrollIntoViewWithin`). Combobox's own parts are unchanged.

## Scenarios

The suggestions of most scenarios are the fruits of [combobox.md](combobox.md#scenarios)
(objects `{ value, label, disabled? }`, Orange disabled). An Item renders the fruit's label.

### `/autocomplete/basic`

`mode="list"`. A `<label>` **"Search"** for the Input; an InputGroup with the Input, a Clear
**"Clear search"** (text "×") and a Trigger **"Show suggestions"** (text "▾"); `items` the
fruits. The Popup holds an Empty **"No suggestion."** and the List. After the InputGroup, a
button **"After"**. The fixture holds the value and the open state. Output: `value: ...`,
`open: ...`, `reason: ...`.

Checks:

1. A `combobox` named "Search", `aria-autocomplete="list"`, `aria-expanded="false"`.
2. A click on the input does not open the list (`openOnInputClick` `false`).
3. Type `b`: the list opens (`reason: input-change`) with "Banana" and "Blueberry", nothing
   highlighted; `value: b`.
4. ArrowDown highlights "Banana" (`aria-activedescendant`), the input still shows `b`; ArrowDown
   "Blueberry"; ArrowDown back to the input; ArrowDown "Banana".
5. Enter: `value: Banana`, `reason: item-press`, the input shows "Banana", the list closes.
6. Escape (closed) clears the text: `value: ` empty, `reason: escape-key`.
7. Type `ch`: "Cherry" only. Escape closes the list (`open: false`) and keeps `ch`; Escape again
   clears it.
8. Type `kiwi`: "No suggestion." and no option; Enter closes the list and keeps `value: kiwi`
   (free text).
9. Select the whole text and delete it: the list closes (`reason: input-clear`), `value: `.
10. ArrowDown on the closed, empty input opens the list on "Apple" (every fruit shown);
    ArrowUp from "Apple" returns to the input; Alt+ArrowUp closes.
11. Type `an`: "Banana", "Mango", "Orange"; ArrowDown ×3 highlights "Orange"
    (`aria-disabled="true"`); Enter does nothing (`value: an`, the list open).
12. A click on "Show suggestions" toggles the list, the focus staying in the input; a click on
    "Mango" gives `value: Mango` and closes the list.
13. "Clear search" is shown while there is text; a click on it empties the text
    (`reason: clear-press`), keeps the focus in the input, and the button is gone.
14. Type `gr`, ArrowDown, then Tab: the list closes (`reason: focus-out`), `value: gr`, the
    focus on "After".
15. Axe finds no violation while open.

### `/autocomplete/both`

`mode="both"`, a `<label>` **"Fruit"**, an InputGroup with the Input, `items` the fruits, an Empty
**"No suggestion."**, the List; then a button **"After"**. Output: `value: ...`, `reason: ...`.

Checks:

1. `aria-autocomplete="both"`.
2. Type `b`: "Banana" and "Blueberry" listed, "Banana" highlighted; the input shows "Banana"
   with "anana" selected; `value: b`.
3. Type `l`: the selection is replaced, the value `bl`; "Blueberry" alone, highlighted; the input
   shows "Blueberry" with "ueberry" selected.
4. Backspace removes the completion: the input shows `bl`, nothing highlighted, `value: bl`;
   Backspace again: `b`, "Banana" and "Blueberry" listed, nothing highlighted.
5. ArrowDown highlights "Banana" and the input shows "Banana" (the list still filtered by `b`);
   ArrowDown "Blueberry", shown; ArrowDown back to the input, which shows `b`.
6. Escape after ArrowDown: the list closes, the input shows `b` (`value: b`).
7. Type `ch` from an empty text: "Cherry" completed; Tab accepts it: `value: Cherry`,
   `reason: input-blur`, the focus on "After".
8. Type `or`: "Orange" is disabled: nothing highlighted nor completed; the input shows `or`.
9. Axe finds no violation while open.

### `/autocomplete/inline`

`mode="inline"`, a `<label>` **"Fruit"**, an InputGroup with the Input and a Trigger **"Show
suggestions"**, `items` the fruits (never filtered), the List. Output: `value: ...`.

Checks:

1. `aria-autocomplete="inline"`.
2. Type `m`: the list opens with all seven fruits; "Mango" highlighted, the input shows "Mango"
   with "ango" selected; `value: m`.
3. ArrowDown highlights "Orange" (the next suggestion, every fruit listed), shown in the input;
   Enter does nothing (disabled); ArrowUp "Mango", Enter: `value: Mango`, the list closed.

### `/autocomplete/none`

`mode="none"`, a `<label>` **"Fruit"**, an InputGroup with the Input and a Trigger **"Show
suggestions"**, `items` the fruits, `openOnInputClick`, `autoHighlight`, the List. Output:
`value: ...`, `reason: ...`.

Checks:

1. `aria-autocomplete="none"`.
2. A click on the input opens the list (`reason: input-press`) with every fruit, nothing
   highlighted.
3. Type `zz`: every fruit still listed (no filtering), "Apple" highlighted (`autoHighlight`), the
   input shows `zz`; Enter: `value: Apple`.
4. Select the text and type `a`: the list opens; deleting the text keeps it open
   (`openOnInputClick`).

### `/autocomplete/groups`

`mode="list"`, a `<label>` **"Produce"**, the Input, `items` two groups (`Fruits`: Apple, Banana,
Cherry; `Vegetables`: Carrot, Celery, Potato), `limit={3}`, an Empty **"Nothing found."**. The
List renders a Separator before every group but the first, then a Group with its GroupLabel and
its Items. Output: `value: ...`.

Checks:

1. Type `c`: a `group` "Fruits" with "Cherry" and a `group` "Vegetables" with "Carrot" and
   "Celery"; ArrowDown ×3 reaches "Celery"; Enter gives `value: Celery`.
2. Type a new text `a` (select all, type): three of the four matches across the groups
   (`limit`): "Apple", "Banana", "Carrot".
3. Type `xyz`: "Nothing found." and no group.

### `/autocomplete/async`

`mode="list"`, a `<label>` **"City"**, the Input, an Empty **"No city found."**, a Status that
says **"Loading…"** while a search runs. The fixture holds `items`: on each value change it
waits 300 ms, then sets `items` to the cities of [combobox.md](combobox.md#combobox-filtered)
whose name contains the value (its own filter: the Root's `filter` is `null`). Output:
`value: ...`, `loaded: ...` (the value of the last search loaded).

Checks:

1. Type `br`: "Loading…", then (`loaded: br`) "Brasília" listed; nothing highlighted.
2. ArrowDown highlights "Brasília"; type `x`: the highlight is dropped and, once loaded
   (`loaded: brx`), "No city found.".
3. Backspace, ArrowDown on "Brasília" once `loaded: br`, Enter: `value: Brasília`.

### `/autocomplete/field`

A `<form>` with a `Field.Root` `name="city"`: a `Field.Label` **"City"**; an autocomplete
(`mode="list"`, an InputGroup with the Input, `items` the cities, `required`, no `name` of its
own); a `Field.Description` **"Type or pick one."**; a `Field.Error` **"Enter a city."**. Then
**"Submit"** and **"Reset"** buttons. Output: `form: ...`.

Checks:

1. A `combobox` named "City", described by "Type or pick one.", not `aria-invalid`.
2. A click on the label focuses the input.
3. "Submit" submits nothing (`form: none`), focuses the input, makes it `aria-invalid="true"`
   and shows "Enter a city."
4. Type `Lima` (free text, no suggestion) and "Submit": `form: city=Lima`.
5. Select the text, type `kra`, ArrowDown, Enter: the input shows "Kraków"; "Submit" gives
   `form: city=Kraków`.
6. "Reset" empties the input; "Submit" submits nothing again.
7. Axe finds no violation, before and after the failed submission.

### `/autocomplete/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a `<label>` **"Fruit"** for
the Input of an autocomplete (an InputGroup with the Input and a Trigger **"Show suggestions"**,
`items` the fruits, an Empty "No suggestion." and the List); its Portal has `keepMounted` (the
Positioner is the kept-mounted part). The checks open it with a click on "Show suggestions".

Checks: the common checks (no "Close with actions"); the Input names the List in
`aria-controls` while closed too.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's `both` and `inline` write the highlighted label into the input only while navigating; typing highlights nothing unless `autoHighlight` | the APG's inline completion: an addition highlights the first suggestion starting with the text and completes it inline, selected; leaving the input accepts it (D4: the APG first) |
| Base UI lets Space choose the highlighted item in an empty input | Space types (the value is free text) |
| Base UI's arrows wrap from the last item to the first | from the last item back to the input, as Combobox (the APG allows both: the user gets back to what they typed) |
| Base UI's `autoHighlight="always"`, `keepHighlight`, `highlightItemOnHover`, `submitOnItemClick`, `onItemHighlighted`, `inline` | not offered (Out of scope) |
