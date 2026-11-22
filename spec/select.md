# Select

## Purpose

Choose **one** value from a list that pops up from a button (APG "select-only combobox": a
`combobox` that is not editable, with a `listbox` popup). It works in a native `<form>`: it
submits, resets and validates as a `<select>` would. Multiple selection, groups, a search field
and scroll arrows are out of scope.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state; renders the hidden input |
| Trigger | `button` | `select-trigger` | the `combobox`; keeps DOM focus while the list is open |
| Value | `span` | `select-value` | inside the Trigger: the selected item's label, or the placeholder |
| Portal | none | | |
| Positioner | `div` | `select-positioner` | positions the popup below the trigger |
| Popup | `div` | `select-popup` | the floating container |
| List | `div` | `select-list` | the `listbox` |
| Item | `div` | `select-item` | an `option` |
| ItemIndicator | `span` | `select-item-indicator` | inside an Item, rendered only while it is selected |
| (hidden input) | `input` | `select-input` | rendered by the Root; what the form submits and validates |

## API

**Root**:

- `value`, `defaultValue` (`null`), `onValueChange(value, details)`: the selected item's `value`
  (a string), or `null`.
- `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`.
- `items`: every item, `{ value, label, disabled? }[]`. The Root needs them while the list is
  closed (the Value's label, typeahead on the closed trigger, the hidden input); the consumer
  renders the Items from the same array.
- `name`, `required`, `disabled`.
- `modal` (`false`): see "Modal".

**Value**: `placeholder` (shown, as the Value's text, while nothing is selected).

**Item**: `value` (string, required), `disabled`. Its label is the matching `items` entry's
`label`.

**ItemIndicator**: `keepMounted` (`false`).

**Positioner**: as Popover's; defaults `side="bottom" align="start"`, `sideOffset` `4`.
`--anchor-width` lets the consumer make the popup at least as wide as the trigger.

When an item is chosen, the value changes (reason `item-press`), the list closes and focus stays
on the trigger.

### Item alignment: a standard placement

Base UI lays the selected item over the trigger (`alignItemWithTrigger`), as macOS menus do. This
spec places the popup **below the trigger** (flipping above when there is no room), as React Aria
and the APG example do, and offers no `alignItemWithTrigger` (D4 §3 "Select placement": the APG
select-only combobox uses a listbox popup; item alignment is a Base UI choice). The trigger stays
visible, the positioning layer (`@fragiola/primitives/positioning`, `anchorFloating`) stays the
only one, and the list never covers what the user just read.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `role="combobox"`, `type="button"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (the List's id, while open), `aria-activedescendant` (the highlighted item's id, while open), `aria-required="true"` when required, `disabled` and `data-disabled`, `data-popup-open` while the list is open (Base UI's name, D4 §3 "Naming"), `data-placeholder` while nothing is selected |
| Value | `data-placeholder` while nothing is selected |
| Positioner, Popup | as Popover's (Popup has no role) |
| List | `role="listbox"`, an `id`, `aria-labelledby` (the trigger's labels: the consumer's `<label>` and the trigger) |
| Item | `role="option"`, an `id`, `aria-selected` (`"true"` on the selected item, `"false"` on the others), `aria-disabled="true"` and `data-disabled`, `data-highlighted`, `data-selected` |
| ItemIndicator | `aria-hidden="true"` |
| hidden input | `name`, `value` (`""` when nothing is selected), `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, structural inline style (visually hidden; not `type="hidden"`, which a browser never validates) |

The Trigger's accessible name comes from the consumer: `<label for>` (a `button` is labelable) or
`aria-label`. Its text (the Value) is its value, not its name: the consumer's label wins.

## Keyboard

DOM focus **always stays on the Trigger**; the highlighted item is announced through
`aria-activedescendant` (virtual focus), as in the APG select-only combobox (D4 §3 "Select focus
and Tab").

| key | closed | open |
| --- | --- | --- |
| ArrowDown | opens, highlights the selected item, else the first enabled one (reason `list-navigation`) | next item (stops at the last) |
| ArrowUp | opens, highlights the selected item, else the first enabled one | previous item (stops at the first) |
| Enter, Space | opens (as ArrowDown) | chooses the highlighted item and closes (reason `item-press`); on a disabled item, nothing |
| Home / End | opens on the first / last item | first / last item |
| a printable character | opens the list on the first item whose label starts with the typed text (reason `list-navigation`; see "Typing while closed") | moves the highlight by typeahead (as Menu); Space while typing continues the text |
| Escape | | closes without choosing (reason `escape-key`) |
| Tab | moves on | chooses the highlighted item (APG), closes (reason `focus-out`, for the value too) and lets focus move on; a disabled highlighted item is not chosen |

Disabled items can be highlighted (as Combobox and Tabs: options stay discoverable) but cannot be
chosen.

### Typing while closed

D4 §3 "Select typing while closed" (**keep**, the APG select-only combobox: a printable character
"opens the listbox … moves visual focus to the first option that matches"):

- On the focused, closed Trigger, a printable character (no Ctrl, Meta or Alt) opens the list
  (reason `list-navigation`) and highlights the first item, **enabled or not**, whose label starts
  with the typed text, compared without case (the typeahead of
  `@fragiola/primitives/collection`, as Menu's). It does not choose: the value changes only on
  Enter, Tab or a click, as with any highlight.
- With no match, nothing happens: the list stays closed.
- The typed text keeps growing while the user types quickly (the typeahead's timeout), so the keys
  that follow the opening key extend the same search: typing `bl` quickly opens on "Banana", then
  moves to "Blueberry".
- Space opens the closed Trigger as Enter does, except right after a typed character (within the
  typeahead's half second), when it continues the text, open or closed.

Base UI chooses the matching item while the list stays closed, as a native `<select>` does; the
behaviour rule (D4) takes the APG's.
## Focus

The Trigger keeps DOM focus while the list is open; a click on an item does not move it. When the
form's validation fails on a required Select, the hidden input's `invalid` event moves focus to the
Trigger.

## Pointer

- A press on the Trigger toggles the list (reason `trigger-press`) and highlights the selected
  item.
- Hovering an item highlights it; clicking an enabled item chooses it; clicking a disabled one
  does nothing.
- A press outside the Trigger and the Popup closes the list (reason `outside-press`).

## Forms

- The hidden input carries `name` and the value (`""` when none), so `FormData` has
  `name=value`, as a `<select>`.
- `required`: a submission with no value is blocked by the browser's constraint validation (no
  `submit` event), and focus moves to the Trigger.
- A form `reset` returns an uncontrolled Select to `defaultValue`; a controlled one reports it
  through `onValueChange` (reason `none`).

## Modal

D4 §3 "Menu and Select `modal`": **non-modal by default** (the APG select-only combobox's popup is
non-modal), with a `modal` option for Base UI parity, as Menu's ([menu.md](menu.md#modal)). While
a Select opened with `modal` is open:

- **scroll lock**: the page does not scroll (`@fragiola/primitives/scroll-lock`);
- **blocked outside pointer**: a press outside the Trigger and the Popup reaches no element of the
  page (no click, no focus, no hover): it only closes the list (reason `outside-press`), and focus
  stays on the Trigger. The body stops taking pointer events (`@fragiola/primitives/inert`,
  `blockOutsidePointer`); the Trigger and the Positioner take them back (`pointer-events: auto`,
  structural inline style), so the Trigger still toggles and the items still work.
- The keyboard is unchanged: the page is not inert, and Tab still chooses, closes and moves on.

Both end when the list closes. Toggling `modal` while open applies at once, without closing.

## Dismissal and layering

The open list is a layer, as Combobox's. Without `modal`, an outside press reaches the page: the
list closes and the press acts where it landed.

## Positioning

As [popover.md](popover.md#positioning), from the Trigger (see "Item alignment").

## Animation

As [popover.md](popover.md#animation).

## RTL

`align="start"` follows the trigger's direction; the keyboard map does not change.

## Scenarios

### `/select/basic`

A `<form>` with a `<label for>` **"Fruit"** for the Trigger, a Select `name="fruit"` `required`
with the Value's placeholder **"Choose a fruit"**, items (value = label in lower case): **Apple**,
**Banana**, **Blueberry**, **Cherry**, **Grape**, **Mango**, **Orange** (disabled); buttons
**"Submit"** and **"Reset"**. The form scenarios print `form: ...` as
[checkbox.md](checkbox.md#scenarios). Output: `value: ...`, `open: ...`, `reason: ...`,
`form: ...`.

Checks:

1. One `combobox` named "Fruit", `aria-expanded="false"`, `aria-haspopup="listbox"`, showing
   "Choose a fruit"; no other form control in the accessibility tree but the buttons.
2. A click opens a `listbox` with the seven options; focus stays on the trigger, which points at a
   highlighted option with `aria-activedescendant`.
3. The popup is below the trigger, its inline start aligned with the trigger's (±1 px), at least
   as wide as the trigger.
4. ArrowDown twice from the trigger (closed) opens it and highlights Apple, then Banana; Enter
   chooses Banana (`value: banana`), the trigger shows "Banana", the list closes, focus stays on
   the trigger.
5. Reopened with ArrowDown, "Banana" is highlighted and `aria-selected="true"`.
6. Open, type `m`: Enter chooses Mango. Closed, Home opens on Apple, End on Orange.
7. **Typing while closed** ("Typing while closed"): focus the closed trigger and type `c`: the list
   opens (`reason: list-navigation`) with "Cherry" highlighted (`aria-activedescendant`), the value
   unchanged (`value: none`); Enter chooses it (`value: cherry`). Closed again, typing `bl`
   quickly opens on "Blueberry". Typing `o` opens on "Orange", disabled but highlighted; Enter
   does not choose it.
8. On "Orange" (disabled, `aria-disabled="true"`), Enter and a click do nothing (it stays open).
9. Escape closes without changing the value (`reason: escape-key`).
10. Open, click "Cherry": `value: cherry`. Open, click outside: closes (`reason: outside-press`).
    Non-modal: open, then click "Reset": the list closes and the press reaches the page ("Reset"
    is focused).
11. Open, ArrowDown, Tab: the highlighted item is chosen and the list closes.
12. "Submit" with no value submits nothing (`form: none`) and focuses the trigger; with Banana,
    `form: fruit=banana`.
13. "Reset" shows "Choose a fruit" again (`value: none`).
14. Axe finds no violation, closed and open.

### `/select/controlled`

A Select labelled **"Fruit"** (the basic items) whose `value` the fixture holds, starting at
`apple`, and which refuses `cherry`: the change is recorded (`requested: cherry`) and the value
stays (spec/README.md, "A controlled value the consumer rejects"). Output: `value: ...`,
`requested: ...`.

Checks: choosing Cherry reports `requested: cherry` while the trigger still shows "Apple"
(`value: apple`) and the list closes; choosing Banana shows "Banana".

### `/select/modal`

Content: the page is taller than the viewport; a `<label for>` **"Fruit"** for the Trigger of a
Select with `modal` (the basic items, placeholder **"Choose a fruit"**, no form); a button
**"Outside button"** after it in the page, whose click prints `outside: pressed`. Output:
`value: ...`, `open: ...`, `reason: ...`, `outside: ...` (`none` until pressed).

Checks ("Modal"):

1. Click the trigger: the list opens; the mouse wheel over the page does not scroll it.
2. Click "Outside button": the list closes (`reason: outside-press`), the press reached no element
   (`outside: none`, "Outside button" is not focused) and focus is on the trigger.
3. Once closed, the page is back: clicking "Outside button" prints `outside: pressed`, and the
   wheel scrolls the page.
4. Reopen; the pointer still works inside: clicking "Cherry" gives `value: cherry`.
5. Reopen; clicking the trigger closes the list (`reason: trigger-press`).

The non-modal default is checked by `/select/basic` (check 10: an outside press closes the list
and reaches the page).

## Differences from Base UI

Measured by the POC against Base UI 1.9 (`Select`, with `alignItemWithTrigger={false}`):

| difference | decision |
| --- | --- |
| On open, DOM focus moves into the list (to the highlighted option) | **keep** DOM focus on the trigger with `aria-activedescendant` (D4 §3, the APG select-only combobox) |
| Tab closes the list without choosing the highlighted option | **choose it** and move on (D4 §3, the APG) |
| A printable character on the closed trigger chooses the matching item without opening | **open on it** (D4 §3, the APG; "Typing while closed") |
| The popup lays the selected item over the trigger (`alignItemWithTrigger`) | **below the trigger**, no `alignItemWithTrigger` (D4 §3) |
| Base UI's Select is modal by default | **non-modal by default**, `modal` as an option (D4 §3) |
| An outside press reports the reason `cancel-open` | `outside-press`, the reason vocabulary of spec/README.md |
| A form reset does not return the Select to its default | **reset** (spec/README.md, "Forms") |
