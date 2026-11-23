# Virtual and async lists

## Purpose

Long and loaded lists in the four list components: **ListboxVirtual**, **SelectVirtual**,
**ComboboxVirtual** and **AutocompleteVirtual** render only the options in view of a list of
thousands, and load its pages through the consumer's loader (`useAsyncList`), while the keyboard,
the typeahead, `aria-activedescendant` and the option's place in the set (`aria-setsize`,
`aria-posinset`) stay right for the options that are not in the DOM.

They are **opt-in parts in entries of their own** (`@fragiola/primitives-<framework>/listbox-virtual`,
`/select-virtual`, `/combobox-virtual`, `/autocomplete-virtual`; `ENTRY_DEPENDENCIES`: each on its
component), built on the toolkit's two mechanisms, `@fragiola/primitives/virtual` (the virtualizer)
and `@fragiola/primitives/async-list` (the async list). A Listbox, Select, Combobox or Autocomplete
that does not opt in is the same code, byte for byte (D8, `docs/size.md`): no `virtualized` prop
in the components themselves (Base UI's Combobox and Autocomplete `virtualized`, with an external
virtualizer), since every app would ship it.

The APG has no virtual list pattern; it says only that a set whose options are not all in the DOM
gives each option `aria-setsize` and `aria-posinset`. The rest follows the components' own specs
([listbox.md](listbox.md), [select.md](select.md), [combobox.md](combobox.md),
[autocomplete.md](autocomplete.md)): a virtual list behaves as the same list rendered whole.
TanStack Virtual and React Aria's virtualizer were read for the behaviour (overscan, measured
sizes, sticky headers, load more), never copied (D9, `docs/decisions.md`, "Virtual lists").

Out of scope: virtual groups (a virtual list is flat: the component's Group, GroupLabel and
Separator are not rendered in it; the toolkit's sticky rows are there for a later grouped list),
horizontal virtual lists, grids and trees (D5), a virtual Menu, Command palette (stage 4).

## The mechanisms

**`@fragiola/primitives/virtual`**, written in-house (AGENTS.md rule 2: no runtime dependency
beyond `@floating-ui/dom`):

- `virtualLayout({ count, size, gap, offset, viewport, overscan, pinned, sticky })`, pure: the
  rows to render for a scroll position, the rows in view plus `overscan` rows (default 4) beyond
  each end, the **pinned** rows (always rendered: the focused, highlighted or selected option, the
  ends a key reaches) and the **sticky** row of the group in view, each `{ index, start, size,
  spaceBefore, sticky }`, with the list's `totalSize` and the room after the last row
  (`spaceAfter`), and the first and last rows in view;
- `rowStarts`, `rowAt`, `activeSticky`, `pageIndex` (the row a page away, by the sizes: PageUp and
  PageDown reach rows that are not rendered);
- `createVirtualizer(options)`: the layout over the DOM. `attach(list, scroller?)` watches the
  scroll container (the list itself when it scrolls, else its nearest scrolling ancestor:
  `scrollContainer`; a popup), its size and the list's `row-gap`; `measure(index, element)`
  measures a rendered row now and on every resize (**measured sizes**; without it, every row is
  `estimateSize`, **fixed sizes**); `scrollToIndex(index, align)` (`auto`, `start`, `center`,
  `end`) scrolls to a row and updates the range at once, so a key that moves the focus renders the
  row within its event; `update(options)`, `range()`, `pageIndex(from, delta)`; `onChange` asks
  the framework to render again only when the rows or their room change.

The rows keep the list's **flow layout**: no wrapper and no spacer element. Each rendered row gets
the room before it as its inline `margin-block-start` and the last one the room after it as its
`margin-block-end`, plus `flex-shrink: 0` (a flex column that scrolls would squeeze its rows) and
`overflow-anchor: none` (structural style); the list's `row-gap` is read and counted. So the list
must lay its rows out in a column with no margin of their own (a flex or grid column, as the
recipes'), and the rows' spacing is their padding or the list's gap. Sizes are layout sizes
(`offsetHeight`, the `ResizeObserver` border box): a popup's opening scale never changes them. A
measured row above the view that changes size moves the scroll position by the change, so the
rows in view stay still (the virtualizer's own scroll anchoring: the browser's would also follow
the rows it adds and removes).

**`@fragiola/primitives/async-list`**: `createAsyncList({ load, filterText, onChange })`, an async
list framework-free: `reload()` loads the first page, `loadMore()` the next one (with the cursor
the previous page returned; nothing while one loads or when there is none), `setFilterText(text)`
loads the first page for the text, `abort()`. The loader gets `{ signal, filterText, cursor }`
and returns `{ items, cursor? }`. A new load **aborts the one in flight** (its signal), and a
stale page is **never used**, whichever arrives first; the items stay until the new page arrives.
The state is `{ items, filterText, status, error, hasMore }`, `status` one of `idle`, `loading`,
`loading-more`, `error`.

Each framework package wraps the async list in its own state, in a utility entry
(`/async-list`, no component's code): React `useAsyncList(options)` and Vue `useAsyncList(options)`
return the state (`items`, `filterText`, `status`, `error`, `hasMore`, `loading`: `status` is
`loading` or `loading-more`) and `reload`, `loadMore`, `setFilterText`; Angular
`injectAsyncList(options)` (in an injection context) returns the same as signals and functions.
Each loads the first page once mounted (`useAsyncList`: on mount; Angular: after the first render)
and aborts the load in flight when destroyed. The first render, on a server too, has `status`
`loading` and no items.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| ListboxVirtual.Root | `div` | `listbox-root` | a Listbox Root that renders its options from `items`; its options are `Listbox.Item`s |
| SelectVirtual.List | `div` | `select-list` | renders a `Select.List` whose options are the Root's `items` in view, each a `Select.Item` |
| ComboboxVirtual.List | `div` | `combobox-list` | renders a `Combobox.List` whose options are the matching items in view, each a `Combobox.Item` |
| AutocompleteVirtual.List | `div` | `autocomplete-list` | renders an `Autocomplete.List` whose options are the matching suggestions in view, each an `Autocomplete.Item` |

A virtual part **is** its component's part (the same `data-primitives-part`, roles and state
attributes, so its recipe and its selectors apply); it adds the virtual rendering and the async
states. Its options are the component's Items, rendered by the consumer for each row: React and
Vue give the virtual part a render function (React `children`, Vue the default slot) of each row's
item and index, and the part adds the row's attributes to the Item it returns; Angular's template
renders the part's `rows()` (`exportAs`) with an `@for`, each Item with the row directive
(`[listboxVirtualRow]`, `[selectVirtualRow]`, `[comboboxVirtualRow]`, `[autocompleteVirtualRow]`)
bound to its row.

## API

Every virtual part takes:

- `itemSize` (`36`): a row's size in pixels before it is measured, a number or a function of the
  index;
- `measure` (`true`): measure the rendered rows (sizes that vary); `false` keeps every row at
  `itemSize` (fixed sizes);
- `overscan` (`4`): the rows rendered beyond each end of the view;
- `loading` (`false`): the list is loading (`data-loading`, `aria-busy="true"`);
- `onLoadMore()`: called when the last row comes into view while not `loading` (load more on
  scroll end); an Angular output, `loadMore`.

**ListboxVirtual.Root**: every Listbox Root prop but `orientation` (a virtual list is vertical),
plus `items` (required): every option, `{ value, label, disabled? }` in the list's order (the
labels typeahead matches, the disabled options a range skips); React and Vue: the render function
of `(item, index)`, returning a `Listbox.Item` with the item's `value` (and its `disabled`).

**SelectVirtual.List** (inside a Select Popup): needs the Root's `items` (Select's own prop: every
item, the labels known while closed); the render function of `(item, index)` returns a
`Select.Item`.

**ComboboxVirtual.List**, **AutocompleteVirtual.List** (inside their Popup): need the Root's
`items` (flat: no groups); the render function of `(entry, index)` over the matching entries (the
filtered items, as the List's own render function) returns an `Item`.

## State attributes and ARIA

Everything of the component's part, plus:

| element | attributes |
| --- | --- |
| the virtual part | `data-loading` and `aria-busy="true"` while `loading` |
| each rendered option | `aria-setsize` (the number of items: the Root's `items`, or the matching entries) and `aria-posinset` (its index + 1); `data-index` (its index); its inline `margin-block-start` / `margin-block-end` when unrendered rows come before / after it |

Only the rows in view, the overscan and the pinned rows are in the DOM (with 10 000 items, a few
dozen options). `aria-activedescendant` and the tab stop always name a rendered option, since the
highlighted, focused and selected options are pinned.

## Keyboard and focus

As the component's spec, over **every** item, rendered or not:

- **ListboxVirtual**: the keys of [listbox.md](listbox.md) ("Keyboard") over `items`: next and
  previous, Home and End, PageUp and PageDown (a page by the rows' sizes: `pageIndex`), the
  typeahead over every label, Shift and Ctrl ranges and Ctrl+A over every item. A key scrolls the
  target option into view (`scrollToIndex`), renders it within the event and focuses it. The
  focused option and the tab stop (the first selected item, else the first) stay rendered, so
  scrolling the focused option out of view keeps the focus.
- **SelectVirtual**: Select's keys (they already move over the Root's `items`); the highlighted
  option is pinned and scrolls into view, so End highlights the last of 10 000 items and the
  typeahead reaches any label.
- **ComboboxVirtual**, **AutocompleteVirtual**: their component's keys. The first and last
  matching items, the highlighted one with its neighbours and the selected one are pinned, so the
  arrows, the wrap through the input, opening on the first, last or selected item and the inline
  completion behave as with every item rendered.

## Pointer and scrolling

A press and a hover on a rendered option are the component's. When the highlighted option changes
(and once the popup is placed), SelectVirtual, ComboboxVirtual and AutocompleteVirtual scroll it
into view by its offset (`scrollToIndex`), after the Item's own scroll, which reads boxes that a
popup's opening scale transforms. A virtual list in a popup should be the popup's scroll container
(the recipes' `max-h-80 overflow-y-auto` on the List): a scrolling listbox that a combobox controls
is a combobox popup, not a region to focus (axe's `scrollable-region-focusable`). Scrolling renders the rows in view;
`onLoadMore` runs when the last row comes into view (the next page then renders under it).

## Forms

The component's: ListboxVirtual's hidden inputs carry the selected values (not only the rendered
ones); Select's, Combobox's and Autocomplete's are their Root's.

## Server rendering

Before the scroll container is measured (a server render, the first client render), a virtual
list renders its first rows (the overscan) and its pinned rows; once mounted, the rows in view.
An async list renders with `status` `loading` and no items; it loads once mounted.

## Scenarios

The items of the virtual scenarios are 10 000 items `{ value: "item-<n>", label: "Item <n>" }`
for `n` from 1 to 10 000, but item 7777, labelled **"Zulu"**, and item 3, disabled. An option
renders its label; each part has the default `itemSize` (36, the recipes' row height in the light
theme) and is its own scroll container, 320 px high (`max-h-80`). The async scenarios load
pages of 50 of those items, filtered by the text (an item matches when its label contains it, case
ignored), after a latency of **150 ms**, or **800 ms** for the text `1` (a slow load that a
quicker one replaces). Output values print the value, or `none`.

### `/listbox-virtual/basic`

A ListboxVirtual Root, `multiple`, `aria-label` **"Items"**, 320 px high, over the 10 000 items.
Output: `count: ...` (the selected values), `last: ...` (the last of them, or `none`).

Checks:

1. A `listbox` named "Items" with `aria-multiselectable="true"`; fewer than 60 options in the DOM;
   the first is "Item 1" with `aria-setsize="10000"` and `aria-posinset="1"`.
2. Tab focuses "Item 1". End focuses "Item 10000" (`aria-posinset="10000"`), in view; Home focuses
   "Item 1" again.
3. PageDown focuses the last option within the list's height from "Item 1" (a page), in view.
4. Typing `z` focuses "Zulu" (`aria-posinset="7777"`), in view.
5. Space selects "Zulu" (`count: 1`, `last: item-7777`); Ctrl+Shift+End selects every item from
   "Zulu" to the end (`count: 2224`, `last: item-10000`); Ctrl+A selects all but the disabled
   "Item 3" (`count: 9999`).
6. With "Item 10000" focused, scrolling the box to its top keeps the focused option in the DOM
   and focused.
7. Axe finds no violation.

### `/listbox-virtual/async`

A ListboxVirtual Root (single), `aria-label` **"Items"**, 320 px high, on `useAsyncList` over the
async loader (no filter). Output: `count: ...` (the items loaded), `status: ...`.

Checks:

1. On load, `status: loading` and the list has `data-loading` and `aria-busy="true"`; then 50
   options (`count: 50`), `status: idle`, no `data-loading`.
2. Scrolling the list to its end loads the next page: `data-loading` while it loads, then
   `count: 100`, and "Item 51" … "Item 100" can be reached by the keyboard (End focuses "Item
   100").
3. Axe finds no violation.

### `/select-virtual/basic`

A Select over the 10 000 items (`items`), a Trigger with `aria-label` **"Item"** and a Value
(placeholder "Choose an item"), a Popup with a SelectVirtual List. Output: `value: ...`.

Checks:

1. A click on the trigger opens the list with fewer than 60 options; `aria-activedescendant` is
   unset (nothing selected); ArrowDown highlights "Item 1".
2. End highlights "Item 10000": `aria-activedescendant` names a rendered option, in view, with
   `aria-posinset="10000"` and `aria-setsize="10000"`.
3. Typing `z` highlights "Zulu"; Enter chooses it (`value: item-7777`) and closes the list.
4. Opening again highlights "Zulu", in view.
5. Axe finds no violation while open.

### `/select-virtual/async`

A Select whose `items` come from `useAsyncList` over the async loader, a Popup with a SelectVirtual
List with `loading` and `onLoadMore`. Output: `count: ...`, `value: ...`.

Checks:

1. Once loaded (`count: 50`), a click on the trigger opens 50 items.
2. Scrolling the popup to its end loads the next page (`data-loading` on the list while loading);
   then End highlights "Item 100".
3. Axe finds no violation while open.

### `/combobox-virtual/basic`

A Combobox over the 10 000 items (the default filter): a `<label>` **"Item"** for the Input, an
InputGroup with the Input, a Popup with an Empty **"No item found."** and a ComboboxVirtual List.
Output: `value: ...`, `input: ...`.

Checks:

1. A click on the input opens the list with fewer than 60 options and no `aria-activedescendant`.
2. ArrowUp highlights "Item 10000" (`aria-posinset="10000"`), in view; ArrowDown returns to the
   input; ArrowDown highlights "Item 1".
3. Type `Item 99`: the 111 matching items ("Item 99", "Item 990" … "Item 999", "Item 9900" …
   "Item 9999") with `aria-setsize="111"`; ArrowUp highlights "Item 9999"
   (`aria-posinset="111"`); Enter chooses it (`value: item-9999`).
4. With "Item 9999" chosen and the input text replaced by `Item 5`, Escape restores the text;
   ArrowDown (closed) opens the whole list on "Item 9999", highlighted and in view.
5. Axe finds no violation while open.

### `/combobox-virtual/async`

A Combobox with `filter={null}` whose `items` come from `useAsyncList` over the async loader, the
input's text sent as the filter text (`setFilterText`), a Status saying **"Loading…"** while
loading, and a ComboboxVirtual List with `loading` and `onLoadMore`. Output: `count: ...`,
`filter: ...` (the text of the shown items), `value: ...`.

Checks:

1. Type `1`: while its page loads (800 ms), the list has `data-loading` and `aria-busy="true"` and
   the Status says "Loading…".
2. Then type `2` (the text `12`): once both settled (1 s), the list shows only items containing
   `12` (`filter: 12`): the slow page for `1` never shows.
3. Scrolling the popup to its end loads the next page of `12` (`count` grows to 100).
4. Axe finds no violation while open.

### `/autocomplete-virtual/basic`

An Autocomplete over the 10 000 labels (strings, `mode="list"`): a `<label>` **"Search"** for the
Input, a Popup with an AutocompleteVirtual List. Output: `value: ...`.

Checks:

1. Type `Item 1`: the list opens with fewer than 60 options, each with `aria-setsize="1112"` (the
   labels containing "Item 1": the numbers starting with 1).
2. ArrowUp highlights the last match, "Item 10000" (`aria-posinset="1112"`), in view; Enter
   writes it into the input (`value: Item 10000`).
3. Axe finds no violation while open.

### `/autocomplete-virtual/async`

An Autocomplete with `filter={null}` whose suggestions come from `useAsyncList` over the async
loader (labels), the text sent as the filter text, a Status saying **"Loading…"** while loading,
and an AutocompleteVirtual List with `loading` and `onLoadMore`. Output: `count: ...`,
`filter: ...`, `value: ...`.

Checks:

1. Type `1`, then at once `2`: once settled (1 s), only suggestions containing `12` show
   (`filter: 12`).
2. Scrolling the popup to its end loads the next page (`count: 100`).
3. Axe finds no violation while open.

## Differences from Base UI

Base UI (1.9) has no virtualizer: its Combobox and Autocomplete take `virtualized` (the consumer's
virtualizer, such as TanStack Virtual, renders the rows and passes each Item its `index`), and its
Select has none. Here the virtualizer is the library's, the opt-in is a part in its own entry (a
`virtualized` prop would ship in every app), all four lists have one, and the async loading is the
library's `useAsyncList` (Base UI leaves it to the consumer).
