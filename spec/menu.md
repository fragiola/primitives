# Menu

## Purpose

A menu of actions opened by a button (APG `menu-button` with a `menu`), with nested submenus.
Checkbox and radio items, context menus and menubars are out of scope (later stages). A list for
choosing a value is a Select or a Combobox (with their Epic).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state of one menu level |
| Trigger | `button` | `menu-trigger` | opens the menu |
| Portal | none | | |
| Positioner | `div` | `menu-positioner` | as in [popover.md](popover.md#positioning) |
| Popup | `div` | `menu-popup` | the `menu` |
| Item | `div` | `menu-item` | a `menuitem` |
| Separator | `div` | `menu-separator` | |
| Group | `div` | `menu-group` | groups items under a label |
| GroupLabel | `div` | `menu-group-label` | names its Group |
| SubmenuRoot | none | | a nested Root; its Trigger is a SubmenuTrigger |
| SubmenuTrigger | `div` | `menu-submenu-trigger` | an item of the parent menu that opens the submenu |

A submenu's Portal, Positioner and Popup are the same parts, inside the SubmenuRoot. The submenu's
Positioner and Popup carry `data-nested`.

## API

**Root**: `open`, `defaultOpen`, `onOpenChange(open, details)`, `loopFocus` (`true`: arrow keys
wrap; Base UI's name, D4 §3 "Naming", the POC's `loop`), `modal` (`false`; see "Modal").

**SubmenuRoot**: `open`, `defaultOpen`, `onOpenChange`, `loopFocus`. Its default positioning is
`side="inline-end" align="start"`. It follows its root menu's `modal`.

**Trigger**: `disabled`.

**Positioner**: as Popover's; defaults `side="bottom" align="start"`.

**Item**: `disabled`, `label` (the text typeahead matches; defaults to the item's text content),
`closeOnClick` (`true`). Activation (Enter, Space, click) fires the element's `click` event, so
consumers listen with their framework's click handler.

**SubmenuTrigger**: `disabled`, `label`, `openOnHover` (`true`), `delay` (`100` ms before a hover
opens it).

**Group**, **GroupLabel**, **Separator**: nothing beyond the contract.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (while open), `data-popup-open` while open (Base UI's name, D4 §3 "Naming"), `data-disabled` |
| Positioner | as Popover's, plus `data-nested` for a submenu |
| Popup | `role="menu"`, `aria-labelledby` (the Trigger's or SubmenuTrigger's id), `aria-orientation="vertical"`, `tabindex="-1"`, `data-open`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style`, `data-nested` |
| Item | `role="menuitem"`, `tabindex="-1"`, `aria-disabled="true"` and `data-disabled` when disabled, `data-highlighted` while highlighted |
| SubmenuTrigger | `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (while open), `data-popup-open` while its submenu is open, `data-highlighted`, `data-disabled` |
| Separator | `role="separator"`, `aria-orientation="horizontal"` |
| Group | `role="group"`, `aria-labelledby` (its GroupLabel's id) |
| GroupLabel | an `id` |

**Highlight follows focus**: the highlighted item is the focused item (roving focus with
`element.focus()`, not `aria-activedescendant`).

## Keyboard

On the Trigger:

| key | action |
| --- | --- |
| Enter, Space, ArrowDown | opens, highlights the first item (reason `list-navigation`; Enter and Space report `trigger-press`) |
| ArrowUp | opens, highlights the last item |

On a Trigger whose menu is already open, these keys do nothing: they leave no highlight pending
for a later open (Epic #22: a later open through the controlled `open` highlighted the first item).

In the menu:

| key | action |
| --- | --- |
| ArrowDown / ArrowUp | next / previous item; wraps when `loopFocus` |
| Home / End | first / last item |
| a printable character | typeahead: the next item whose label starts with the typed string (characters typed within 500 ms accumulate; repeating one character cycles through the items starting with it) |
| Enter, Space | activates the highlighted item: fires its `click`, then closes every menu level (reason `item-press`) when `closeOnClick`, and focuses the root Trigger |
| ArrowRight (LTR) on a SubmenuTrigger, or Enter / Space on it | opens the submenu and highlights its first item |
| ArrowLeft (LTR) in a submenu | closes it, highlights its SubmenuTrigger |
| Escape | closes the current level only (reason `escape-key`): a submenu returns focus to its SubmenuTrigger, the root menu to the Trigger |
| Tab, Shift+Tab | closes every level (reason `focus-out`); focus moves to the next / previous tabbable element after / before the Trigger |

**Disabled items stay focusable** (APG: "Disabled menu items are focusable but cannot be
activated"; the APG keyboard practice keeps menu items, listbox options and tabs focusable when
disabled, so screen reader users can discover them). Arrow keys, Home/End, typeahead and hover
reach them; Enter, Space and clicks on them do nothing.

A key that opens or closes a level reaches the DOM within the event, so a quick second key
reaches the new level (AGENTS.md, "Porting a component", item 8).

## Focus

- Opening highlights (and focuses) an item as the keyboard table says; opening with a pointer
  focuses the popup without highlighting an item.
- Closing by Escape or by activating an item returns focus to the Trigger (or the SubmenuTrigger
  for a submenu's Escape).
- An outside press on a non-modal menu moves no focus (the press puts it where the user pressed);
  on a modal menu, where the press reaches nothing, focus returns to the Trigger.

## Pointer

- A press on the Trigger toggles (reason `trigger-press`).
- Hovering an item highlights it (and focuses it); leaving the popup removes the highlight.
- Clicking an item activates it.
- Hovering a SubmenuTrigger opens its submenu after `delay`. Clicking it opens it at once.
- **Safe area**: while the pointer moves from an open SubmenuTrigger toward its submenu, crossing
  sibling items does not highlight them nor close the submenu (a triangle from the pointer to the
  submenu's near edge, `@fragiola/primitives/pointer`, `isInSafeArea`).
- A press outside every level closes them all (reason `outside-press`).

## Modal

D4 §3 "Menu and Select `modal`": **non-modal by default** (the APG menu button is non-modal), with
a `modal` option for Base UI parity. While a menu opened with `modal` is open:

- **scroll lock**: the page does not scroll (`@fragiola/primitives/scroll-lock`, as a Dialog's);
- **blocked outside pointer**: a press outside every level reaches no element of the page (no
  click, no focus, no hover): it only closes every level (reason `outside-press`), and focus
  returns to the Trigger. The body stops taking pointer events
  (`@fragiola/primitives/inert`, `blockOutsidePointer`); the Trigger and every level's
  Positioner take them back (`pointer-events: auto`, structural inline style), so the Trigger
  still toggles and the submenus still work.
- The keyboard is unchanged: the page is not inert, and Tab still closes every level and moves on
  (the APG menu has no focus trap).

Both end when the menu closes. A submenu follows its root: it adds no lock of its own.

## Dismissal and layering

Each menu level is a layer; a submenu is a child layer of its parent menu. Escape closes one level;
an outside press, Tab and item activation close them all.

## Positioning

As [popover.md](popover.md#positioning), with the defaults above. A submenu flips to the
`inline-start` side when the `inline-end` side lacks room (`data-side` then reports
`inline-start`).

## Animation

As [popover.md](popover.md#animation), for each level.

## RTL

- ArrowLeft opens a submenu and ArrowRight closes it.
- A submenu opens to the left (`side="inline-end"` is logical).
- The direction is a [DirectionProvider](direction.md)'s, else the computed one (for the keys and
  for every positioned popup's logical side).

## Scenarios

### `/menu/basic`

Content: a Trigger **"Actions"**; items **"Edit"**, **"Duplicate"**, **"Archive"** (disabled), a
Separator, **"Delete"**; a button **"After menu"** after the trigger in the page. Clicking an item
prints it. Output: `open: ...`, `reason: ...`, `action: <last item clicked>`.

Checks:

1. Trigger has `aria-haspopup="menu"`, `aria-expanded="false"`.
2. Focus the trigger, press ArrowDown: a `menu` labelled "Actions" opens and "Edit" is focused.
3. ArrowDown → "Duplicate"; ArrowDown → "Archive" (disabled, still focusable); ArrowDown →
   "Delete"; ArrowDown wraps to "Edit"; ArrowUp wraps to "Delete"; Home → "Edit"; End → "Delete".
4. "Archive" has `aria-disabled="true"`; Enter on it does nothing: the menu stays open and the
   output has no `action`.
5. Typeahead: press `d` → "Duplicate"; `d` again → "Delete".
6. Enter on "Delete": output `action: Delete`, the menu closes (`reason: item-press`), focus on
   "Actions".
7. Focus the trigger, press ArrowUp: the menu opens with "Delete" focused.
8. Escape closes (`reason: escape-key`), focus on "Actions".
9. Open, press Tab: the menu closes and focus is on "After menu".
10. Click "Actions", hover "Duplicate": it is focused; click it: `action: Duplicate`.
11. The separator has `role="separator"`.
12. Non-modal: open with a click, then click "After menu": the menu closes
    (`reason: outside-press`) and the press reaches the page: "After menu" is focused.
13. Axe finds no violation while open.

### `/menu/controlled`

Content: a Trigger **"Actions"** with items **"Edit"**, **"Delete"** and **"Done"**
(`closeOnClick` off: its click sets the page's `open` to `false`), and a button **"Open from
outside"** that sets the page's `open` state. Output: `open: ...`.

Checks:

1. Open with a click, focus the trigger and press Enter, then Escape; "Open from outside" opens
   the menu with no item highlighted.
2. Open with a click, click "Done": the menu closes through `open` (reason `none`) and focus,
   left inside it, returns to "Actions" (as Popover's, `popover.md` "Focus").

### `/menu/submenu`

Content: Trigger **"File"**; items **"New file"**, a SubmenuTrigger **"Share"** whose submenu has
**"Email"**, **"Link"**, **"Slack"**, then **"Print"**. Output as in basic.

Checks:

1. Open with ArrowDown, ArrowDown to "Share": it has `aria-haspopup="menu"`,
   `aria-expanded="false"`.
2. ArrowRight opens a `menu` labelled "Share" with "Email" focused; "Share" has
   `aria-expanded="true"`.
3. ArrowLeft closes the submenu and focuses "Share"; the root menu stays open.
4. ArrowRight again, then Escape: only the submenu closes; Escape again closes the root and
   focuses "File".
5. Enter on "Link" (inside the submenu): output `action: Link`; every level closes; focus on
   "File".
6. Pointer: hover "Share", wait for the submenu; move the pointer diagonally from "Share" to
   "Slack", passing over "Print": the submenu stays open and "Slack" ends highlighted.
7. The submenu starts at or after the end edge of "Share" (to its right in LTR); contract layer:
   its popup has `data-side="inline-end"`.

### `/menu/submenu?dir=rtl`

The submenu scenario in `dir="rtl"`.

Checks: ArrowLeft on "Share" opens the submenu, ArrowRight closes it; the submenu ends at or
before the start edge of "Share" (to its left).

### `/menu/groups`

Content: Trigger **"View"**; a Group labelled by GroupLabel **"Sort by"** with items **"Name"**,
**"Date"**; a Separator; a Group labelled **"Show"** with **"Hidden files"**.

Checks: two `group` elements named "Sort by" and "Show"; arrow navigation crosses groups
("Date" → "Hidden files").

### `/menu/modal`

Content: the page is taller than the viewport; a Trigger **"Options"** on a Root with `modal`;
items **"Rename"** and **"Remove"**; a button **"Outside button"** after the trigger in the page,
whose click prints `outside: pressed`. Output: `open: ...`, `reason: ...`, `action: ...`,
`outside: ...` (`none` until pressed).

Checks:

1. Click "Options": the menu opens; the mouse wheel over the page does not scroll it.
2. Click "Outside button": the menu closes (`reason: outside-press`), the press reached no
   element (`outside: none`, "Outside button" is not focused) and focus is on "Options".
3. Once closed, the page is back: clicking "Outside button" prints `outside: pressed`, and the
   wheel scrolls the page.
4. Reopen; the pointer still works inside: clicking "Rename" prints `action: Rename`.
5. Reopen; clicking "Options" closes the menu (`reason: trigger-press`).

## Differences from Base UI

Measured by the POC against Base UI 1.9: no behaviour difference, but one default.

| difference | decision |
| --- | --- |
| Base UI's Menu is modal by default | **non-modal by default**, `modal` as an option (D4 §3): the APG menu button is non-modal |

Base UI reads the direction from its `DirectionProvider`, not from the document.
