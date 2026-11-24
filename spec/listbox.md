# Listbox

## Purpose

A list of options that stays on the page, for choosing **one** value or **several** (the APG
`listbox` pattern), as a form control: it submits, resets and validates, alone or in a
[Field](field.md). It is built on the toolkit's collections mechanism
(`@fragiola/primitives/selection`: the list model, the selection rules and the listbox key map),
which TagGroup, Command and CascadeSelect will reuse.

The APG decides the roles, the keys and the two multiple selection models. Base UI has no
listbox (its reference checkout, 1.9, ships Select and Combobox, whose lists are popups): where
the APG says nothing, Select's and Combobox's parts and names are the API pattern, and this spec
says which option it took and why (D4; `docs/decisions.md`, "Collections").

Out of scope here: virtualization and async lists (the opt-in ListboxVirtual, [virtual-lists.md](virtual-lists.md)), grid and tree collections (D5:
`@fragiola/data-grid`, `@fragiola/tree`), drag and drop (`@fragiola/dnd`), `aria-activedescendant`
focus (an input that keeps the focus is Combobox's and Autocomplete's), item actions
(`onAction`), `disallowEmptySelection`, `readOnly`, and an option's description.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `listbox-root` | the `listbox`; holds the state; renders the hidden inputs as its last children |
| Item | `div` | `listbox-item` | an `option`, focusable (roving `tabindex`) |
| ItemIndicator | `span` | `listbox-item-indicator` | inside an Item, rendered only while it is selected |
| Group | `div` | `listbox-group` | a `group` of items |
| GroupLabel | `div` | `listbox-group-label` | names its Group |
| Separator | `div` | `listbox-separator` | between items or groups |
| (hidden input) | `input` | `listbox-input` | rendered by the Root, one or more: what the form submits and validates |

## API

**Root**:

- `multiple` (`false`): several options can be selected (`aria-multiselectable="true"`).
- `value`, `defaultValue`, `onValueChange(value, details)`: the selected item's `value` (a
  string) or `null` (default `null`); with `multiple`, the selected values **in the list's
  order** (default `[]`; values no rendered item has stay at the end, in their order). Reasons:
  `item-press` for a press, `keyboard` for a key, `none` for a form reset.
- `selectionBehavior` (`"toggle"`): the APG's selection model. `"toggle"` is the recommended
  model: moving the focus never changes the selection, Space toggles. `"replace"` is the
  alternative model: the selection follows the focus, Ctrl moves without selecting (see
  "Keyboard").
- `orientation` (`"vertical"`): `aria-orientation`; a horizontal list moves with ArrowLeft and
  ArrowRight (mirrored in RTL) instead of ArrowUp and ArrowDown.
- `loopFocus` (`true`): the arrows wrap from the last option to the first and back.
- `disabled`: every option is disabled and none takes focus.
- `name`, `required`.

**Item**: `value` (string, required), `disabled`, `label` (the text typeahead matches; default:
its text content).

**ItemIndicator**: `keepMounted` (`false`).

**Group**, **GroupLabel**, **Separator**: nothing beyond the contract.

## The collections mechanism

`@fragiola/primitives/selection` holds the framework-free part, pure functions over the rendered
options (rule 2: no component state):

- `createListModel(nodes)`: the options in order, each `{ key, textValue, disabled }`, with their
  indexes and the enabled keys;
- `applySelection(model, state, change, { mode, behavior })`: the next `{ selected, anchor }`
  for a change (`toggle`, `replace`, `range` from the anchor or from a given key, `all`), in
  `none`, `single` or `multiple` mode: disabled options are never selected, a range and select
  all skip them, the selection is in the model's order;
- `listKeyTarget(event, model, focused, options)`: the option a key focuses and the selection
  change it makes, for the orientation, the direction, `loop`, the mode, the behaviour, the page
  size and the typeahead;
- `pageTarget(elements, current, delta, container, orientation)`: the option a page away
  (PageUp, PageDown), measured on the scroll container.
- `rowTarget(elements, current, delta)`: the option in the row above or below, in a list laid
  out in wrapping rows, measured on the rendered boxes (ColorSwatchPicker's ArrowUp and ArrowDown,
  spec/color-swatch-picker.md).

Typeahead is `createTypeahead` from `/collection`. Each framework registers its items, holds the
value, the focused option and the anchor, and calls these.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="listbox"`, `aria-orientation`, `aria-multiselectable="true"` with `multiple`, `aria-required="true"` when required, `aria-disabled="true"` and `data-disabled` when disabled, `data-orientation`, `data-multiple`; in a Field, the field's ids (`aria-labelledby`, `aria-describedby`, `aria-invalid`) and states |
| Item | `role="option"`, an `id`, `tabindex` (`0` on the tab stop, `-1` on the others), `aria-selected` (`"true"` or `"false"`, on every option), `aria-disabled="true"` and `data-disabled` when disabled, `data-selected`, `data-highlighted` on the focused option while the focus is in the list |
| ItemIndicator | `aria-hidden="true"` |
| Group | `role="group"`, `aria-labelledby` (its GroupLabel's id) |
| GroupLabel | an `id` |
| Separator | `role="presentation"` (a `listbox` owns only groups and options, as Select's), `data-orientation` (the other orientation than the list's) |
| hidden inputs | see "Forms" |

The Root's accessible name comes from the consumer (`aria-labelledby`, `aria-label`) or from a
`Field.Label`; a `<label for>` cannot name a `div`.

## Keyboard

DOM focus moves to the options (roving `tabindex`). "Next" and "previous" are ArrowDown and
ArrowUp, or ArrowRight and ArrowLeft in a horizontal list (swapped in RTL). Disabled options take
focus (APG: options stay discoverable, as Select's and Combobox's) but are never selected: a key
or a press that would select one does nothing to it, and a range or select all skips it.

**Every selection model:**

| key | action |
| --- | --- |
| Tab into the list | focuses the first selected option, else the first option (APG); while the focus stays inside, the tab stop is the focused option |
| next / previous | focus the next / previous option (wrapping with `loopFocus`) |
| Home / End | focus the first / last option |
| PageDown / PageUp | focus the option a page (the scroll container's height, or width when horizontal) after / before, or the last / first when the list does not scroll |
| a printable character | typeahead: focuses the next option whose label starts with the typed text (`createTypeahead`, 500 ms), disabled options included |
| Tab | leaves the list |

**`selectionBehavior="toggle"`** (the APG's recommended model):

| key | single | multiple |
| --- | --- | --- |
| a focus move (above) | the selection does not change | the selection does not change |
| Space, Enter | selects the focused option (pressing the selected one keeps it) | toggles the focused option; it becomes the anchor |
| Shift + next / previous | as next / previous | focuses the next / previous option and toggles it; it becomes the anchor |
| Shift + Space | as Space | selects every option from the anchor to the focused one, adding them to the selection (with no anchor, the focused one) |
| Ctrl + Shift + Home / End | as Home / End | selects every option from the focused one to the first / last, adding them, and focuses the first / last |
| Ctrl + A | nothing | selects every option; when every enabled option is already selected, unselects them all (the APG's option) |

**`selectionBehavior="replace"`** (the APG's alternative model):

| key | single | multiple |
| --- | --- | --- |
| a focus move (above, typeahead included) | selects the focused option (the selection follows the focus) | the focused option becomes the only selected one, and the anchor |
| Ctrl + a focus move | focuses without selecting | focuses without selecting |
| Space, Enter | selects the focused option | the focused option becomes the only selected one |
| Ctrl + Space | as Space | toggles the focused option; it becomes the anchor |
| Shift + next / previous | as next / previous | focuses the next / previous option and toggles it (APG); it becomes the anchor |
| Shift + Space | as Space | the options from the anchor to the focused one become the selection |
| Ctrl + Shift + Home / End | as Home / End | the options from the focused one to the first / last become the selection, and it focuses the first / last |
| Ctrl + A | nothing | as in the toggle model |

Ctrl is Control or, on macOS, Meta (either is accepted on every platform). A key with Alt does
nothing. Ranges follow the list's order across groups; GroupLabels and Separators never take focus.

## Pointer

A press on an option focuses it (it is focusable) and:

| press | toggle model | replace model |
| --- | --- | --- |
| a press | single: selects it; multiple: toggles it, it becomes the anchor | it becomes the only selected one, and the anchor |
| Ctrl / Meta + press | as a press | multiple: toggles it, it becomes the anchor |
| Shift + press | multiple: selects every option from the anchor to it, adding them | multiple: the options from the anchor to it become the selection |

A Shift press keeps the browser from selecting the page's text. A press on a disabled option
focuses it and selects nothing. Neither the APG nor Base UI defines the pointer: these are React
Aria's and the platforms' list rules (`docs/decisions.md`, "Collections").

## Focus

The tab stop is the focused option while the focus is inside the list. Once the focus leaves, the
next Tab into the list lands on the first selected option, else the first option (APG). A list
with no option has no tab stop. Before the options are known (a server render, the first render),
every option has `tabindex="-1"`, as Toolbar's items; once mounted, the tab stop is computed.
Angular's options register as they render (as its Radios), so its server render already has the
tab stop; every framework's hydrated page ends the same (the ssr layer).

## Forms

With a `name`, the Root renders, as its last children (spec/README.md, "Forms"):

- **single**: one visually hidden input with the `name`, the value (`""` with none), `required`,
  `disabled`, `aria-hidden="true"`, `tabindex="-1"` (not `type="hidden"`, so the browser
  validates it);
- **`multiple`**: one `type="hidden"` input per value, with the `name`, in value order; plus one
  visually hidden input with no `name` that carries `required` while nothing is selected.

Every hidden input carries `data-primitives-part="listbox-input"`. Without a `name`, the
validation input is still rendered, so `required` and a Field work. A form reset returns an
uncontrolled list to its `defaultValue` (reason `none`). When the browser's validation finds the
list invalid, focus goes to its tab stop.

**In a Field** ([field.md](field.md#integration-contract)): the Root is the field's control (as
RadioGroup): named by the `Field.Label` (`aria-labelledby`), described by the field, `aria-invalid` on the Root; focus and blur are the focus entering
and leaving the list; `validate` gets the value; the validated element is the visually hidden
input; the field's `name` and `disabled` win.

## RTL

A horizontal list swaps ArrowLeft and ArrowRight (the direction provider, else the computed
direction); a vertical list's keys do not change.

## Scenarios

The fruits of [combobox.md](combobox.md#scenarios), as Items: **Apple** (`apple`),
**Banana** (`banana`), **Blueberry** (`blueberry`), **Cherry** (`cherry`), **Grape** (`grape`),
**Mango** (`mango`), **Orange** (`orange`, disabled). Each Item renders its label and an
ItemIndicator **"✓"**. Output values print a list as its values joined with `,`, and `none` for
`null` or `[]`.

### `/listbox/single`

A heading **"Fruit"** (`id`) names the Root (`aria-labelledby`); the fruits; the fixture holds
`value` (starting `null`) and prints it. Then a button **"After"**. Output: `value: ...`,
`reason: ...`.

Checks:

1. A `listbox` named "Fruit" with `aria-orientation="vertical"` and no `aria-multiselectable`;
   seven options, every one `aria-selected="false"`; "Orange" has `aria-disabled="true"`.
2. Tab from the page start focuses "Apple" (nothing is selected); ArrowDown focuses "Banana"
   without selecting (`value: none`), with `data-highlighted`.
3. Space selects "Banana" (`value: banana`, `reason: keyboard`, `aria-selected="true"`, its
   indicator shown); ArrowDown and Enter select "Blueberry" (`value: blueberry`), "Banana" is
   unselected; Space again keeps "Blueberry".
4. End focuses "Orange"; Space does nothing (`value: blueberry`); ArrowDown wraps to "Apple";
   ArrowUp wraps back to "Orange"; Home focuses "Apple".
5. Typeahead: `m` focuses "Mango"; `b` then `l` quickly focuses "Banana" then "Blueberry"; after
   a pause, `b` focuses "Banana" (the next match, wrapping) and `b` again at once "Blueberry".
6. Tab moves to "After"; Shift+Tab comes back to the selected "Blueberry" (not the last focused).
7. A click on "Cherry" selects and focuses it (`value: cherry`, `reason: item-press`); a click on
   "Orange" (forced: it is disabled) focuses it and selects nothing.
8. Home, then PageDown (the list does not scroll) focuses "Orange"; PageUp focuses "Apple".
9. Axe finds no violation.

### `/listbox/multiple`

A heading **"Toppings"** names a `multiple` Root (toggle model) whose value the fixture holds,
starting `[]`: **Cheese** (`cheese`), **Mushrooms** (`mushrooms`), **Olives** (`olives`,
disabled), **Onions** (`onions`), **Peppers** (`peppers`), **Pineapple** (`pineapple`),
**Spinach** (`spinach`), **Tomatoes** (`tomatoes`), each with an ItemIndicator "✓". Output:
`value: ...`.

Checks (every path of the toggle model's multiple column):

1. A `listbox` named "Toppings" with `aria-multiselectable="true"`; eight options, none selected.
2. Tab focuses "Cheese"; Space selects it (`value: cheese`); ArrowDown and Space add "Mushrooms"
   (`value: cheese,mushrooms`); Space again removes it (`value: cheese`).
3. Shift+ArrowUp focuses "Cheese" and toggles it off (`value: none`); Shift+ArrowDown focuses
   and toggles "Mushrooms" (`value: mushrooms`); Shift+ArrowDown on to "Olives" (disabled)
   focuses it and selects nothing; Shift+ArrowDown toggles "Onions"
   (`value: mushrooms,onions`).
4. Anchor and Shift+Space: ArrowDown focuses "Peppers", Space adds it (the anchor:
   `value: mushrooms,onions,peppers`); ArrowDown ×2 to "Spinach", Shift+Space adds "Pineapple"
   and "Spinach" (`value: mushrooms,onions,peppers,pineapple,spinach`).
5. Ctrl+A selects every enabled option
   (`value: cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes`); Ctrl+A again unselects
   them all (`value: none`).
6. Home, then ArrowDown ×3 to "Onions": Ctrl+Shift+End selects "Onions" to "Tomatoes" and
   focuses "Tomatoes" (`value: onions,peppers,pineapple,spinach,tomatoes`). Home, ArrowDown to
   "Mushrooms": Ctrl+Shift+Home adds "Cheese" and "Mushrooms" and focuses "Cheese"
   (`value: cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes`).
7. Pointer: Ctrl+A unselects them all (`value: none`); a click on "Onions" selects it (the
   anchor), a Shift+click on "Spinach" adds "Onions" to "Spinach"
   (`value: onions,peppers,pineapple,spinach`); a click on "Peppers" removes it
   (`value: onions,pineapple,spinach`).
8. Axe finds no violation with options selected.

### `/listbox/replace`

The toppings of `/listbox/multiple` with `selectionBehavior="replace"`, named **"Toppings"**.
Output: `value: ...`.

Checks (every path of the replace model's multiple column):

1. Tab focuses "Cheese" and selects nothing; ArrowDown focuses and selects "Mushrooms"
   (`value: mushrooms`); ArrowDown to "Olives" (disabled) focuses it and leaves `value: mushrooms`;
   ArrowDown selects "Onions" alone (`value: onions`).
2. Ctrl+ArrowDown focuses "Peppers" and keeps `value: onions`; Ctrl+Space adds it
   (`value: onions,peppers`); Ctrl+Space again removes it (`value: onions`).
3. Shift+ArrowDown from "Peppers" focuses and toggles "Pineapple" (`value: onions,pineapple`).
4. Space on "Pineapple" makes it the only one (`value: pineapple`, the anchor); Ctrl+ArrowDown ×2
   to "Tomatoes", Shift+Space selects "Pineapple" to "Tomatoes" alone
   (`value: pineapple,spinach,tomatoes`).
5. Ctrl+Shift+Home from "Tomatoes" selects every enabled option and focuses "Cheese"
   (`value: cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes`); Ctrl+A unselects them
   all (`value: none`).
6. Pointer: a click on "Cheese" selects it alone (`value: cheese`); a Ctrl+click on "Onions" adds
   it (`value: cheese,onions`); a Shift+click on "Peppers" makes "Onions" to "Peppers" the
   selection (`value: onions,peppers`); a click on "Spinach" makes it the only one
   (`value: spinach`).
7. Typeahead `t` focuses and selects "Tomatoes" alone (`value: tomatoes`).

### `/listbox/groups`

A heading **"Produce"** names a single Root with two Groups: **"Fruits"** (Apple, Banana,
Cherry) and **"Vegetables"** (Carrot `carrot`, Celery `celery`, Potato `potato`), each with its
GroupLabel, a Separator between them. Output: `value: ...`.

Checks:

1. A `group` named "Fruits" with three options and a `group` named "Vegetables" with three; the
   contract layer checks the Separator (`role="presentation"`, `data-orientation="horizontal"`).
2. Tab focuses "Apple"; ArrowDown ×3 crosses into "Carrot" (the labels and the Separator take no
   focus); End focuses "Potato"; ArrowDown wraps to "Apple".
3. Typeahead `ce` focuses "Celery"; Enter selects it (`value: celery`).
4. Axe finds no violation.

### `/listbox/horizontal`

A heading **"Size"** names a single Root with `orientation="horizontal"` and `loopFocus` `false`,
`defaultValue` `"m"`: **S** (`s`), **M** (`m`), **L** (`l`), **XL** (`xl`), in a row. Output:
`value: ...`.

Checks:

1. A `listbox` with `aria-orientation="horizontal"`; Tab focuses the selected "M".
2. ArrowRight focuses "L"; ArrowDown does nothing; End focuses "XL"; ArrowRight stays on "XL"
   (no loop); Enter selects it (`value: xl`).
3. ArrowLeft focuses "L", Home "S".

### `/listbox/horizontal?dir=rtl`

The same page right to left. Checks: Tab focuses "M"; ArrowLeft focuses "L"; ArrowRight focuses
"M" again, ArrowRight "S".

### `/listbox/field`

A `<form>` with:

- a `Field.Root` `name="fruit"`: a `Field.Label` **"Fruit"**, a single Root with the fruits and
  `required`, a `Field.Description` **"Pick one."**, a `Field.Error` **"Choose a fruit."**;
- a heading **"Toppings"** naming a `multiple` Root `name="toppings"` with `defaultValue`
  `["cheese"]` and the toppings of `/listbox/multiple`;
- a **"Submit"** and a **"Reset"** button.

Output: `form: ...` (the submitted entries, `none` when the submission was blocked).

Checks:

1. A `listbox` named "Fruit", described by "Pick one.", not `aria-invalid`; no hidden input is in
   the accessibility tree.
2. "Submit" submits nothing (`form: none`), focuses "Apple", makes the list
   `aria-invalid="true"` with `data-invalid`, and shows "Choose a fruit."; the description is
   "Pick one. Choose a fruit.".
3. A click on "Banana" selects it and hides the error; "Submit" gives
   `form: fruit=banana&toppings=cheese`.
4. Adding "Onions" (a click) and "Submit" give `form: fruit=banana&toppings=cheese&toppings=onions`.
5. "Reset" returns both lists to their defaults (no fruit, "Cheese" alone); "Submit" submits
   nothing again.
6. Axe finds no violation, before and after the failed submission.

## Differences from Base UI and the references

Base UI 1.9 has no Listbox. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The value | strings, `null` or an array, in the list's order | Select's values are strings; a form submits them in the order a reader sees them |
| `loopFocus` | `true` | the library's composites (Toolbar, RadioGroup, Menubar) and Base UI's lists loop by default; the APG examples stop at the ends but the pattern has no rule |
| Single selection, toggle model | Space, Enter and a press select; pressing the selected option keeps it | the APG's "selection may follow focus" is optional; a single-select listbox is a radio-like choice (Select never unselects), and `null` returns only through a reset or the controlled value |
| Ranges in the replace model | replace the selection; in the toggle model they add to it | the replace model's own rule (a move with no modifier replaces); the APG says only "selects contiguous items" |
| The pointer | React Aria's and the platforms' rules (the table above) | the APG defines no pointer |
| `aria-activedescendant` focus | not offered: DOM focus on the options | the APG's default; an input that keeps focus is Autocomplete's and Combobox's |
