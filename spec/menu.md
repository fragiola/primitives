# Menu

## Purpose

A menu of actions opened by a button (APG `menu-button` with a `menu`), with nested submenus,
checkbox items and groups of radio items (APG `menuitemcheckbox`, `menuitemradio`, Issue #34). A
menu opened from an area at the pointer is a [ContextMenu](context-menu.md), built on these parts.
A bar of menus is a [Menubar](menubar.md), whose items are these Roots' Triggers ("In a
Menubar"). A list for choosing a form value is a Select or a Combobox.

Every part's part attribute names the component it belongs to: `menu-*` inside a `Menu.Root`,
`context-menu-*` inside a `ContextMenu.Root` (read from the Root, as the calendar family's shared
parts are).

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
| CheckboxItem | `div` | `menu-checkbox-item` | a `menuitemcheckbox` |
| CheckboxItemIndicator | `span` | `menu-checkbox-item-indicator` | inside a CheckboxItem, rendered while it is checked |
| RadioGroup | `div` | `menu-radio-group` | a `group` of radio items, holding their value |
| RadioItem | `div` | `menu-radio-item` | a `menuitemradio` |
| RadioItemIndicator | `span` | `menu-radio-item-indicator` | inside a RadioItem, rendered while it is checked |
| SubmenuRoot | none | | a nested Root; its Trigger is a SubmenuTrigger |
| SubmenuTrigger | `div` | `menu-submenu-trigger` | an item of the parent menu that opens the submenu |

A submenu's Portal, Positioner and Popup are the same parts, inside the SubmenuRoot. The submenu's
Positioner and Popup carry `data-nested`.

## API

**Root**: `open`, `defaultOpen`, `onOpenChange(open, details)` (an `OpenChangeDetails`,
[README](README.md#open-change-details)), `onOpenChangeComplete(open)`, the actions (`close()`,
`unmount()`; React `actionsRef`), `loopFocus` (`true`: arrow keys wrap; Base UI's name, D4 §3
"Naming", the POC's `loop`), `modal` (`false`; see "Modal"), `handle`, `triggerId` /
`defaultTriggerId` (the active trigger, [README](README.md#detached-triggers)); its content may
be a function of the active trigger's `payload`.

**SubmenuRoot**: `open`, `defaultOpen`, `onOpenChange`, `onOpenChangeComplete`, the actions,
`loopFocus`. Its default positioning is `side="inline-end" align="start"`. It follows its root
menu's `modal`. It takes no handle (its trigger is its SubmenuTrigger).

**Trigger**: `disabled`, `handle`, `payload`, `id` (as [Dialog's](dialog.md#api)).

**createHandle**: `createMenuHandle<Payload>()` (React and Vue also `Menu.createHandle`).

**Portal**: `container`, `keepMounted` (`false`; [README](README.md#lifecycle)).

**Positioner**: as Popover's; defaults `side="bottom" align="start"`.

**Item**: `disabled`, `label` (the text typeahead matches; defaults to the item's text content),
`closeOnClick` (`true`). Activation (Enter, Space, click) fires the element's `click` event, so
consumers listen with their framework's click handler.

**SubmenuTrigger**: `disabled`, `label`, `openOnHover` (`true`), `delay` (`100` ms before a hover
opens it).

**Group**, **GroupLabel**, **Separator**: nothing beyond the contract.

**CheckboxItem**: `checked`, `defaultChecked` (`false`), `onCheckedChange(checked, details)`
(`{ reason: "item-press", event }`), `disabled`, `label`, `closeOnClick` (`false`: a click toggles
it and leaves the menu open, Base UI's default for checkable items).

**CheckboxItemIndicator**: `keepMounted` (`false`: rendered only while the item is checked).

**RadioGroup**: `value`, `defaultValue` (`null`), `onValueChange(value, details)` (`{ reason:
"item-press", event }`; the value is a string, `null` for none), `disabled` (every RadioItem in it).

**RadioItem**: `value` (string, required), `disabled`, `label`, `closeOnClick` (`false`).
Checking the checked item changes nothing (no `onValueChange`).

**RadioItemIndicator**: `keepMounted` (`false`).

**Activating a checkable item** (CheckboxItem, RadioItem; APG menu):

| how | effect |
| --- | --- |
| Space | toggles the CheckboxItem / checks the RadioItem, the menu **stays open** |
| Enter | toggles / checks, then **closes every level** (reason `item-press`) and focuses the root Trigger (APG: Enter activates the item and closes the menu) |
| a click | toggles / checks; closes every level only when `closeOnClick` |

The keys fire the element's `click`, as Item's activation does; a disabled item (or one in a
disabled RadioGroup) does nothing.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `aria-haspopup="menu"`, `aria-expanded` (`"true"` on the active trigger while open), `aria-controls` (on the active trigger while open), `data-popup-open` on the active trigger while open (Base UI's name, D4 §3 "Naming"), `data-disabled`, an `id` |
| Positioner | as Popover's (`data-open` / `data-closed`; `hidden` while kept mounted and closed), plus `data-nested` for a submenu |
| Popup | `role="menu"`, `aria-labelledby` (the active Trigger's or the SubmenuTrigger's id), `aria-orientation="vertical"`, `tabindex="-1"`, `data-open` / `data-closed`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style`, `data-nested` |
| Item | `role="menuitem"`, `tabindex="-1"`, `aria-disabled="true"` and `data-disabled` when disabled, `data-highlighted` while highlighted |
| SubmenuTrigger | `role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (while open), `data-popup-open` while its submenu is open, `data-highlighted`, `data-disabled` |
| Separator | `role="separator"`, `aria-orientation="horizontal"` |
| Group | `role="group"`, `aria-labelledby` (its GroupLabel's id) |
| GroupLabel | an `id` |
| CheckboxItem | `role="menuitemcheckbox"`, `tabindex="-1"`, `aria-checked` (`"true"` / `"false"`), `data-checked` / `data-unchecked` (exactly one), `data-highlighted`, `aria-disabled="true"` and `data-disabled` when disabled |
| CheckboxItemIndicator | `aria-hidden="true"`, `data-checked` / `data-unchecked`, `data-disabled` |
| RadioGroup | `role="group"`, `data-disabled`; named by the consumer (`aria-label`, or a Group's GroupLabel around it) |
| RadioItem | `role="menuitemradio"`, `tabindex="-1"`, `aria-checked`, `data-checked` / `data-unchecked`, `data-highlighted`, `aria-disabled="true"` and `data-disabled` when disabled (itself or its group) |
| RadioItemIndicator | `aria-hidden="true"`, `data-checked` / `data-unchecked`, `data-disabled` |

The items of a level are its `menuitem`, `menuitemcheckbox` and `menuitemradio` elements, in DOM
order: the arrow keys, Home/End and typeahead move through all of them, across groups.

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
| Enter, Space | activates the highlighted item: fires its `click`, then closes every menu level (reason `item-press`) when `closeOnClick`, and focuses the root Trigger; a checkable item follows "Activating a checkable item" (Space keeps the menu open, Enter closes it) |
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
- A close with the reason `imperative-action` (a handle, the actions) returns focus as `none`
  does: a root menu's focus left inside it goes back to its Trigger.
- **Moving to another trigger** (detached triggers): a press on another Trigger of the open menu
  moves the menu there and focuses its popup with no highlight, as a pointer opening does.

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

Each menu level is a layer of the nested overlay tree; a submenu is a child layer of its parent
menu, and a menu opened from inside another overlay (a Popover's popup) is that overlay's child
([`/dialog/nested-tree`](dialog.md#dialognested-tree)). Escape closes one level; an outside press,
Tab and item activation close them all; a press inside a parent level closes the levels below it
only.

## Detached triggers

As [Dialog's](dialog.md#detached-triggers) ([README](README.md#detached-triggers)): the menu
anchors to its active trigger and is labelled by it; a press on another Trigger while open moves it
there (it stays open, with that Trigger's payload, `onOpenChange(true, details)` with
`trigger-press`); the keys of the Trigger table open it from any of its Triggers.

## Positioning

As [popover.md](popover.md#positioning), with the defaults above. A submenu flips to the
`inline-start` side when the `inline-end` side lacks room (`data-side` then reports
`inline-start`).

## Animation

As [popover.md](popover.md#animation), for each level; `keepMounted`, `onOpenChangeComplete` and the
actions as [README](README.md#lifecycle).

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

### `/menu/checkbox-radio`

A view-options menu. Content: a Trigger **"View"**; a Popup with a CheckboxItem **"Show
toolbar"** (`defaultChecked`), a CheckboxItem **"Show status bar"**, a Separator, and a Group
labelled by the GroupLabel **"Sort by"** holding a RadioGroup (`defaultValue` `"name"`) with the
RadioItems **"Name"** (`name`), **"Date"** (`date`) and **"Size"** (`size`, disabled). Each
checkable item renders its indicator (`✓` for the checkboxes, `•` for the radios) before its
label. Output: `open: ...`, `reason: ...`, `toolbar: <true|false>`, `status bar: <true|false>`,
`sort: <value>` (every state starts as its default: `toolbar: true`, `status bar: false`,
`sort: name`).

Checks:

1. Open with ArrowDown: "Show toolbar" is a `menuitemcheckbox` with `aria-checked="true"`, "Show
   status bar" one with `aria-checked="false"`; a `group` named "Sort by" holds three
   `menuitemradio`s, "Name" `aria-checked="true"`, "Date" and "Size" `"false"`; "Size" has
   `aria-disabled="true"`.
2. ArrowDown to "Show status bar", Space: `status bar: true`, `aria-checked="true"`, the menu
   stays open with "Show status bar" focused.
3. Space again: `status bar: false`.
4. ArrowDown to "Date" (the arrows cross the separator and the group), Space: `sort: date`, "Date"
   `aria-checked="true"`, "Name" `"false"`; the menu stays open.
5. ArrowDown to "Size" (disabled, still focusable), Space and Enter: nothing changes (`sort:
   date`), the menu stays open.
6. Home, Enter on "Show toolbar": `toolbar: false`, the menu closes (`reason: item-press`), focus
   on "View".
7. Click "View", click "Show status bar": `status bar: true` and the menu stays open
   (`closeOnClick` is `false`); click "Name": `sort: name`, still open.
8. Typeahead reaches the checkable items: open, type `d`: "Date" is focused.
9. Contract layer: the checked items have `data-checked`, the others `data-unchecked`; an
   indicator is rendered inside "Show toolbar" and "Name" only (with `data-checked`,
   `aria-hidden="true"`).
10. Axe finds no violation while open.

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

### `/menu/detached`

One Menu opened from three rows. A list of three rows, each with the name **"Ada"**, **"Grace"**,
**"Alan"** as text and a Trigger **"Actions for Ada"** (`id="actions-ada"`, `payload` `"Ada"`),
**"Actions for Grace"** (`actions-grace`), **"Actions for Alan"** (`actions-alan`), with the
`handle` of a Root after the list. The Root's content is a function of the payload: a Positioner
and a Popup with the items **"Rename <name>"** and **"Delete <name>"** (one text node each);
clicking an item prints it. Output: `open: ...`, `reason: ...`, `trigger: <id or none>`,
`chosen: <the last item clicked, or none>`.

Checks:

1. Click "Actions for Grace": a `menu` named "Actions for Grace" with the items "Rename Grace" and
   "Delete Grace", its top below the trigger's bottom and its start edge aligned with the
   trigger's (±1 px); only "Actions for Grace" has `aria-expanded="true"`.
2. Click "Actions for Alan" while it is open: the menu stays open (`open: true`, `reason:
   trigger-press`, `trigger: actions-alan`), is named "Actions for Alan" with "Rename Alan", below
   "Actions for Alan"; "Actions for Grace" has `aria-expanded="false"`.
3. Click "Delete Alan": `chosen: Delete Alan`, the menu closes (`reason: item-press`), focus on
   "Actions for Alan".
4. Focus "Actions for Ada" and press ArrowDown: a `menu` named "Actions for Ada" opens with "Rename
   Ada" focused (`reason: list-navigation`, `trigger: actions-ada`).
5. Axe finds no violation while open.

### `/menu/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a Trigger **"Actions"**;
a Portal with `keepMounted` holding a Positioner (the kept-mounted part) and a Popup with the
items **"Edit"** and **"Delete"**.

Checks: the common checks (no "Close with actions").

## In a Menubar

A `Menu.Root` whose Trigger sits in a [Menubar](menubar.md) is one of the bar's menus (Epic #49,
Issue #48). Menu holds only the **contract of a parent bar**, each framework's context in the
menu's own folder (React and Vue `components/menu/menu-bar-context.ts`, Angular
`packages/angular/menu/utils/menu-bar.ts`), which the Menubar provides; the bar's decisions are
Menubar's code, so `/menu` alone ships none of it (`ENTRY_DEPENDENCIES`: `menubar` on `menu`). A
Root that finds the contract:

- **Root**: follows the bar's `modal` (its own is ignored, as a submenu's); keeps the bar for its
  Trigger, Positioner and Popup, and hides it from the Roots inside its content (a Menu opened
  from one of its items is no menu of the bar).
- **Trigger**: renders `role="menuitem"` and the bar's roving `tabindex` (it registers with the
  bar's roving-focus scope, and tells the bar when it takes focus); registers its menu with the
  bar, so the bar can open, close and focus into it; is disabled by its own `disabled` or the
  bar's, as `aria-disabled="true"` (never the native `disabled`; the consumer's click handler does
  not run while disabled); and **hands its keys, its press and its pointer entering to the bar**
  instead of handling them itself (the Trigger's table under "Keyboard" is the bar's there,
  spec/menubar.md). Its Space key up still does nothing (no click on key up).
- **Positioner**: defaults to `side="inline-end"` in a vertical bar (`bottom` in a horizontal one).
- **Popup**, at every level of the bar's menu: a key the level does not handle itself (not its
  arrows, Home, End, Enter, Space, Tab, a submenu's close key, nor a typeahead match) is offered
  to the bar before typeahead, with the level (root or submenu); the bar handles it or leaves it.
  The SubmenuTrigger's open key is the SubmenuTrigger's, as always (it never reaches the popup).
- **The opening focus**: an opening the bar asks for may **keep the focus where it is** (the
  pending highlight `keep`, beside `first`, `last` and none): the popup and its items take no
  focus, and the bar's item keeps it (APG: a move between menus keeps the focus on the bar).
- **Closing** as the bar moves on: the bar closes the root level only (reason `list-navigation`,
  which returns no focus there); its open submenus close with it through the overlay tree (reason
  `none`, which takes no focus from the bar's item).

Outside a bar nothing changes: a Trigger alone, or in a [Toolbar](toolbar.md), has none of the
above (it joins no roving scope).

## Differences from Base UI

Measured by the POC against Base UI 1.9: no behaviour difference, but one default.

| difference | decision |
| --- | --- |
| Base UI's Menu is modal by default | **non-modal by default**, `modal` as an option (D4 §3): the APG menu button is non-modal |
| Enter on a CheckboxItem or RadioItem follows `closeOnClick` (the menu stays open by default) | **Enter closes the menu**, Space keeps it open (the APG menu: Enter activates the item and closes the menu; Space on a `menuitemcheckbox` toggles it without closing); a click follows `closeOnClick` (Base UI) |

Base UI reads the direction from its `DirectionProvider`, not from the document.
