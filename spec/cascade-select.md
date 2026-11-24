# CascadeSelect

## Purpose

Choose **one path** through a tree of options (a region, then a country, then a city) from a
button whose popup shows one list per level, side by side (Zag's and Ark's cascader, Ant Design's
Cascader; React Aria has none). It works in a native `<form>` as a [Select](select.md) does: it
submits, resets and validates.

**The pattern (D4).** The APG has no cascading pattern and Base UI 1.9 has no CascadeSelect. The
APG-closest shape is the APG **select-only combobox** ([select.md](select.md)) whose popup holds
**one `listbox` per open level**: the Trigger is the `combobox`, DOM focus stays on it, the
highlighted option is announced through `aria-activedescendant`, and the levels open and close as
the APG menu's submenus do (Right opens, Left closes, mirrored in RTL), with Menu's hover delay and
safe area ([menu.md](menu.md#pointer)). Zag, Ark and Ant Design were read for the behaviour, never
copied (D9).

Out of scope: multiple selection, a search field, loading the children of a level on demand,
virtual levels, a `modal` option (a later Issue may add Select's).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state; renders the hidden input |
| Trigger | `button` | `cascade-select-trigger` | the `combobox`; keeps DOM focus while open |
| Value | `span` | `cascade-select-value` | inside the Trigger: the chosen item's label (or the path's), or the placeholder |
| Portal | none | | |
| Positioner | `div` | `cascade-select-positioner` | positions the popup below the trigger |
| Popup | `div` | `cascade-select-popup` | the floating container of the levels |
| Level | `div` | `cascade-select-level` | the `listbox` of one depth; `hidden` while that depth is not open |
| Item | `div` | `cascade-select-item` | an `option`; a parent (it has children) or a leaf |
| ItemIndicator | `span` | `cascade-select-item-indicator` | inside an Item, rendered only while the Item is on the chosen path |
| (hidden input) | `input` | `cascade-select-input` | rendered by the Root; what the form submits and validates |

## API

**Root**:

- `items` (required): the tree, `{ value, label, disabled?, children? }[]` (the toolkit's
  `CascadeItem`, `@fragiola/primitives/cascade`). An item with a non-empty `children` is a
  **parent**, else a **leaf**. Values are unique among siblings; the labels are the app's text.
- `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the chosen **path**, the values
  from the first level down (`["europe", "france", "paris"]`); `[]` when nothing is chosen.
- `changeOnSelect` (`false`): a parent can be chosen too (see "Choosing").
- `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`, `onOpenChangeComplete(open)`,
  the actions (`close()`, `unmount()`; React `actionsRef`), as Select's.
- `name`, `required`, `disabled`.
- `valueSeparator` (`"/"`): joins the path in the hidden input (`europe/france/paris`).

**Value**: `placeholder` (shown while nothing is chosen); `separator` (optional): without it the
Value shows the **last** chosen item's label ("Paris", as a Select shows its item's), with it the
labels of the whole path joined by it ("Europe / France / Paris" with `" / "`). The library adds
no text of its own: the labels are the app's, and so is the separator.

**Portal**: `container`, `keepMounted` (`false`).

**Positioner**: as Select's (Popover's props; defaults `side="bottom" align="start"`,
`sideOffset` `4`, `--anchor-width`).

**Popup**: nothing beyond the contract. It holds the Levels; the app lays them out (side by
side, `display: flex`).

**Level**: `depth` (required, `0` for the first level). The app renders one Level per depth of
its tree. A Level's items are the first level's (`depth` `0`) or the children of the item open
at the depth above; the Level hands them to its content (React: `children` as a function
`(items) => ...`; Vue: the default scoped slot `{ items }`; Angular: `level.items()` through its
`exportAs`), which renders an Item per entry, in order. A Level whose depth is not open renders
`hidden` and hands no items.

**Item**: `value` (required): the entry's `value` among its Level's items; its `label`,
`disabled` and `children` are the entry's.

**ItemIndicator**: `keepMounted` (`false`).

### The levels and the highlight

The Root keeps the **active path**: the highlighted item of each open level, from the first
level down to the level that holds the highlight (the deepest). The Trigger's
`aria-activedescendant` is the last item of the active path; the items above it are the open
parents. A level is open when it is the first level, when its parent is on the active path above
the highlighted item, or when the highlighted item is a parent that the **pointer** opened (its
children are shown while the highlight stays on it, as a Menu's submenu opened by hover).

Moving the highlight within a level closes the levels below it. A keyboard highlight never opens
a level by itself: Right (or Enter) does, as in the APG menu.

### Choosing

- A **leaf** is chosen by Enter, Space, Tab or a click: the value becomes the active path (reason
  `item-press`, `focus-out` for Tab) and the popup closes; focus stays on the Trigger.
- A **parent** opens its level (Enter, Space, Right, a click, or the pointer's hover delay) and is
  not chosen; with `changeOnSelect`, Enter, Space and a click on it also choose the path up to it
  (reason `item-press`) and the popup **stays open** on it, its level open, so the user can go on;
  Tab on it chooses it and closes.
- A disabled item can be highlighted (as Select's) but is never chosen, and a disabled parent
  never opens its level.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | as Select's: `role="combobox"`, `type="button"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (the open Levels' ids, while open), `aria-activedescendant` (the highlighted item's id, while open), `aria-required="true"` when required, `disabled` and `data-disabled`, `data-popup-open`, `data-placeholder` while nothing is chosen |
| Value | `data-placeholder` while nothing is chosen |
| Positioner, Popup | as Select's |
| Level | `role="listbox"`, an `id`, `data-depth` (its depth); the first level `aria-labelledby` the Trigger's labels (as Select's List), a deeper one `aria-labelledby` its parent option; `hidden` while not open |
| Item | `role="option"`, an `id`, `aria-selected` (`"true"` on the item of the chosen path at its depth, else `"false"`), `aria-disabled="true"` and `data-disabled`, `data-highlighted` (the highlighted item), `data-selected` (on the chosen path), `data-has-children` (a parent), `data-expanded` and `aria-controls` (the open Level of its children) while its level is open |
| ItemIndicator | `aria-hidden="true"` |
| hidden input | as Select's: `name`, `value` (the path joined by `valueSeparator`, `""` when nothing is chosen), `required`, `disabled`, `aria-hidden="true"`, `tabindex="-1"`, visually hidden |

**A parent option.** An `option` may not carry `aria-expanded` nor `aria-haspopup` (ARIA 1.2;
axe `aria-allowed-attr`), so a parent says it opened a level with `aria-controls` (a global
attribute) pointing at that Level, which is named by the parent itself (`aria-labelledby`): a
screen reader reads the next list as "France, list box". Its state for styling is
`data-has-children` and `data-expanded` (Base UI has no cascader; the names say what they mean,
as `data-selected` does). The app may show a chevron from `data-has-children`.

## Keyboard

DOM focus **always stays on the Trigger** (APG select-only combobox). "Inline-end" is Right in
LTR and Left in RTL (the Trigger's direction, `@fragiola/primitives/direction`; Menu's
`submenuKeys`).

| key | closed | open |
| --- | --- | --- |
| ArrowDown, ArrowUp, Enter, Space | opens on the chosen path (every level of it open, the chosen item highlighted), else on the first enabled item of the first level (reason `list-navigation`) | ArrowDown / ArrowUp: the next / previous item of the highlighted item's level (stops at the ends); Enter / Space: see "Choosing" |
| Home / End | opens on the first / last item of the first level | the first / last item of the level |
| inline-end (Right in LTR) | | on an enabled parent: opens its level and highlights its first item (reason `list-navigation` for the level, none for the value) |
| inline-start (Left in LTR) | | in a deeper level: closes it and highlights its parent; in the first level, nothing |
| a printable character | opens the popup on the first item of the first level whose label starts with the typed text (as Select's "Typing while closed") | typeahead **within the highlighted item's level** (the toolkit's `createTypeahead`); Space right after a typed character continues the text |
| Escape | | closes without choosing (reason `escape-key`) |
| Tab | moves on | chooses the highlighted item when it can be chosen (an enabled leaf, or an enabled parent with `changeOnSelect`), closes (reason `focus-out`) and lets focus move on |

The highlight moves through the items of one level only; disabled items are highlighted, never
chosen. The toolkit's `cascadeKeyAction(key, rtl)` (`@fragiola/primitives/cascade`) maps a key
to its action for every framework.

## Pointer

- A press on the Trigger toggles the popup (reason `trigger-press`), opening on the chosen path.
- Hovering an item highlights it and closes the levels below its own. Hovering an enabled parent
  for `delay` (100 ms, Menu's SubmenuTrigger default) opens its level, the highlight staying on
  it; hovering an item of that level moves the highlight into it.
- **Safe area** (Menu's, `@fragiola/primitives/pointer`, `isInSafeArea`): while the pointer moves
  from a parent whose level is open toward that level, crossing sibling items does not highlight
  them nor close the level.
- A click on a parent opens its level at once (and chooses it with `changeOnSelect`); a click on
  an enabled leaf chooses it and closes; a click on a disabled item does nothing.
- A press outside the Trigger and the Popup closes the popup (reason `outside-press`).

## Focus

As Select's: the Trigger keeps DOM focus while open, a click on an item does not move it, and an
invalid required CascadeSelect's hidden input moves focus to the Trigger.

## Forms

- The hidden input carries `name` and the path joined by `valueSeparator` (`""` when none), so
  `FormData` has `location=europe/france/paris`. **The separator** is `/` by default (the path of
  a URL; Ant Design and Zag submit no form value): an app whose values may hold a `/` sets another
  one.
- `required`: a submission with no path is blocked by the browser's constraint validation, and
  focus moves to the Trigger.
- A form `reset` returns an uncontrolled CascadeSelect to `defaultValue`; a controlled one
  reports it through `onValueChange` (reason `none`).
- In a [Field](field.md) the Trigger is the field's labelable control (Select's row of the
  field's table): `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, the field's state
  attributes, focus and blur from the Trigger; `validate` gets the path; the field's `name` and
  `disabled` win (`ENTRY_DEPENDENCIES` `["field"]`).

## Dismissal and layering

As Select's (non-modal): the open popup is a layer; Escape and an outside press close it.

## Positioning

As [select.md](select.md#positioning): below the Trigger, flipping above when there is no room;
the levels inside the popup are the app's layout.

## Animation

As Select's ([popover.md](popover.md#animation), `keepMounted`, `onOpenChangeComplete`).

## RTL

The keys that open and close a level swap (Left opens, Right closes); `align="start"` follows the
Trigger's direction, and the app's `display: flex` row lays the deeper levels to the left.

## Server rendering

Closed, the Root renders the Trigger, the Value and the hidden input; the Value shows the
labels of a `defaultValue`, read from `items`, so the server and the browser render the same.

## Scenarios

The tree of every scenario, "Location" (value = label in lower case):

- **Africa**: **Kenya** (Mombasa, Nairobi), **Nigeria** (Abuja, Lagos)
- **Americas**: **Brazil** (Recife, Rio), **Canada** (Ottawa, Toronto)
- **Antarctica** (a leaf)
- **Europe**: **France** (Lyon, Paris), **Germany** (Berlin, Munich, disabled), **Portugal**
  (Lisbon, Porto)
- **Oceania** (disabled, a parent: **Fiji** (Suva))

Each Item holds its label and an ItemIndicator `✓`; the popup lays its Levels side by side.

### `/cascade-select/basic`

A `<form>` with a `<label for>` **"Location"** for the Trigger, a CascadeSelect
`name="location"` `required`, the Value with the placeholder **"Choose a place"** and the
separator `" / "`; three Levels; buttons **"Submit"** and **"Reset"**. Output: `value: ...` (the
path joined by `/`, `none` when empty), `open: ...`, `reason: ...`, `form: ...`.

Checks:

1. One `combobox` named "Location", `aria-expanded="false"`, `aria-haspopup="listbox"`, showing
   "Choose a place".
2. ArrowDown opens one `listbox` named "Location" with five options; "Africa" is highlighted
   (`aria-activedescendant`); it has `data-has-children`, "Antarctica" has not; no other level is
   shown.
3. ArrowDown three times highlights "Europe"; no second level opens. ArrowRight opens a second
   `listbox`, named "Europe", with "France" highlighted; "Europe" has `data-expanded` and
   `aria-controls` that level's id.
4. ArrowDown highlights "Germany"; ArrowRight opens a third level with "Berlin"; ArrowDown
   highlights "Munich" (disabled); Enter does nothing. ArrowUp, Enter chooses "Berlin":
   `value: europe/germany/berlin`, the Trigger shows "Europe / Germany / Berlin", the popup closes
   and focus stays on the Trigger.
5. ArrowLeft in a deeper level closes it and highlights its parent; ArrowLeft in the first level
   does nothing.
6. Reopened with ArrowDown: three levels open, "Berlin" highlighted, "Europe", "Germany" and
   "Berlin" `aria-selected="true"` with their ItemIndicators.
7. **Typeahead per level**: open, ArrowDown to "Europe", ArrowRight, type `p`: "Portugal" is
   highlighted (the second level's items only). Closed, typing `e` opens on "Europe".
8. "Antarctica" (a leaf of the first level): Enter chooses it (`value: antarctica`), the popup
   closes. "Oceania" (disabled parent): ArrowRight and Enter do nothing.
9. Escape closes without changing the value (`reason: escape-key`).
10. Open, ArrowDown to "Americas", ArrowRight, ArrowDown, Tab: "Canada" is a parent, not chosen;
    the popup closes (`reason: focus-out`), the value unchanged. Open on "Antarctica", Tab:
    `value: antarctica`.
11. **Pointer**: a click on the Trigger opens it; a click on "Europe" opens its level at once
    (highlight on "Europe"); a click on "Portugal" opens the third; a click on "Porto" chooses it
    (`value: europe/portugal/porto`).
12. **Hover**: open, hover "Europe" and wait: its level opens with the highlight on "Europe".
    Hover "Africa": Europe's level closes and, after the delay, Africa's opens.
13. **Safe area**: hover "Europe" and wait for its level; move the pointer diagonally from
    "Europe" to "France", passing over "Americas": Europe's level stays open and "France" ends
    highlighted.
14. "Submit" with no value submits nothing (`form: none`) and focuses the Trigger; with
    "Porto", `form: location=europe/portugal/porto`.
15. "Reset" shows "Choose a place" again (`value: none`).
16. Axe finds no violation, closed and open on three levels.

### `/cascade-select/basic?dir=rtl`

The basic scenario in `dir="rtl"`.

Checks: open on "Europe", ArrowLeft opens its level ("France" highlighted), ArrowRight closes it
(highlight on "Europe"); the second level is laid to the left of the first.

### `/cascade-select/change-on-select`

A `<label for>` **"Location"** for the Trigger of a CascadeSelect with `changeOnSelect` and
`defaultValue` `["americas"]`, the Value without a separator and with the placeholder **"Choose a
place"**. Output: `value: ...`, `open: ...`.

Checks:

1. The Trigger shows "Americas" (the server render too).
2. Open: "Americas" is highlighted and selected; its level is closed (the chosen path's levels
   below the chosen item stay closed).
3. ArrowUp to "Africa", Enter: `value: africa`, the popup stays open and Africa's level opens
   with "Kenya" highlighted; Enter: `value: africa/kenya`, Kenya's level opens with "Mombasa";
   Enter: `value: africa/kenya/mombasa` and the popup closes; the Trigger shows "Mombasa".
4. Open, ArrowLeft twice to "Africa", Tab: `value: africa`, the popup closes.
5. A click on "Europe": `value: europe`, the popup stays open with its level.

### `/cascade-select/field`

A `<form>`: a Field (`name` `"place"`) with a `Field.Label` **"Place"**, the CascadeSelect with
`defaultValue` `["europe", "france", "lyon"]` and the Value's separator `" / "`, a
`Field.Description` **"Where you live."**; **"Submit"** and **"Reset"** buttons. Output:
`value: ...`, `form: ...`.

Checks:

1. The `combobox` is named "Place" and described by "Where you live."; it shows "Europe / France /
   Lyon"; the Field has `data-filled`.
2. "Submit": `form: place=europe/france/lyon`.
3. Closed, Home opens on "Africa"; ArrowRight, ArrowRight, Enter: `value: africa/kenya/mombasa`;
   "Submit": `form: place=africa/kenya/mombasa`.
4. Focus on the Trigger gives the Field `data-focused`; Tab away gives it `data-touched`.
5. "Reset": "Europe / France / Lyon" again (`value: europe/france/lyon`).
6. Axe finds no violation.

## Differences from Zag and Ark

Zag's cascade select (read for the behaviour, D9) is the closest reference:

| difference | decision |
| --- | --- |
| Highlighting a parent with the keyboard shows its children | **Right or Enter opens a level** (the APG menu's submenu rule); the pointer's hover delay opens it, as Menu's |
| The trigger's focus moves into the list | **DOM focus stays on the Trigger** (the APG select-only combobox, as Select) |
| A parent option carries `aria-expanded` / `aria-haspopup` | **`aria-controls` and `data-expanded`** (an `option` may not carry them, ARIA 1.2) |
| No form value | **a hidden input** with the path joined by `valueSeparator` (Select's form behaviour) |
| `changeOnSelect` selects the parent on highlight | **on Enter, Space or a click**, the popup staying open (a highlight never chooses, as Select) |
