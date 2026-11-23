# Menubar

## Purpose

A persistent bar of menu buttons, an application's "File, Edit, View" (APG `menubar`): the bar is
**one tab stop**, the arrow keys move between its items, each item opens a [Menu](menu.md), and
once a menu is open the arrows and the pointer move from one menu to the next. Its menus are
ordinary `Menu.Root`s whose `Menu.Trigger`s are the bar's items, so everything a Menu has works
inside it: items, groups, separators, checkbox and radio items, submenus, the overlay tree. A
single menu opened by a button is a [Menu](menu.md); a bar of buttons and toggles is a
[Toolbar](toolbar.md); a site's navigation is a [NavigationMenu](navigation-menu.md).

**Scope: stage 2** (Epic #49, Issue #48). The APG `menubar` pattern decides the roles, the keys,
the roving tab stop, the focus while a menu is open and the moves between menus; Base UI's
`Menubar` (1.9) decides the parts (one `Menubar` around `Menu.Root`s), the hover switching and
the props `orientation`, `loopFocus`, `modal` and `disabled` (D4). Base UI's Menubar is modal by
default; this one is not ("Differences from Base UI").

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Menubar | `div` | `menubar-root` | the `menubar`; holds the roving tab stop and moves between its menus |

Its items are the `Menu.Trigger`s of the `Menu.Root`s inside it, at any depth (a wrapping element
is fine). **Their parts stay Menu's** and keep Menu's part attributes (`menu-trigger`,
`menu-popup`, `menu-item`, ...): the consumer writes `Menu.Root`, `Menu.Trigger` and the rest from
`/menu`, unlike a ContextMenu, whose parts are re-exported under its own namespace and named
`context-menu-*` ([context-menu.md](context-menu.md)). Menubar is one component, not a namespace
(as ToggleGroup).

One entry, `/menubar` (D8), built on `/menu` (`ENTRY_DEPENDENCIES`: `menubar` on `menu`). Menu
holds only the **contract of a parent bar** (each framework's context in the menu's own folder:
[menu.md, "In a Menubar"](menu.md#in-a-menubar)): what a Root, a Trigger and a Popup read and hand
over when a bar is around them. Every decision about the bar (the keys, the moves, the hover
switch) is Menubar's code; `/menu` alone holds none of it, and holds no Menubar code (the bundle
guard).

## API

**Menubar**:

- `orientation` (`"horizontal"`): `"horizontal"` or `"vertical"`; which arrows move between the
  items ("Keyboard"), where the menus open ("Positioning"), `aria-orientation` and
  `data-orientation`.
- `loopFocus` (`true`): the arrows wrap from the last item to the first and back.
- `modal` (`false`): every menu of the bar is modal while open ([menu.md, "Modal"](menu.md#modal):
  scroll lock and a blocked outside pointer), and the bar still takes the pointer ("Modal"). A
  `Menu.Root` in a bar follows the bar's `modal`; its own `modal` prop is ignored there (as a
  submenu follows its root).
- `disabled` (`false`): every item is disabled ("Disabled items").

Every other attribute (`aria-label`, `aria-labelledby`, `id`) is forwarded; the accessible name is
the consumer's (APG: a menubar is named by a label).

**Inside a Menubar**, the parts of `/menu` keep their API ([menu.md](menu.md#api)), with:

- `Menu.Trigger`: `disabled` makes it a disabled item of the bar ("Disabled items"); `handle`,
  `payload` and `id` are unchanged (a bar's menus are not meant to be detached: a Trigger outside
  the bar is no item of it).
- `Menu.Root`: `modal` is the bar's; `loopFocus` is its menu's own (the arrows inside the menu).
- `Menu.Positioner`: its default `side` is `bottom` in a horizontal bar and `inline-end` in a
  vertical one; `align` `start` (Base UI's defaults).

A `Menu.Root` rendered inside a menu of the bar (a menu opened from an item of another popup) is
no menu of the bar: the bar's contract stops at the menus whose Trigger is the bar's own.

### The framework APIs

| | React | Vue | Angular |
| --- | --- | --- | --- |
| the bar | `<Menubar orientation loopFocus modal disabled aria-label>` (`@fragiola/primitives-react/menubar`) | `<Menubar orientation loop-focus modal disabled aria-label>` (`@fragiola/primitives-vue/menubar`) | `<div menubar [orientation] [loopFocus] [modal] [disabled] aria-label>` (class `Menubar`, `exportAs: "menubar"`, `@fragiola/primitives-angular/menubar`) |
| its menus | `<Menu.Root>` with `<Menu.Trigger>` inside it | the same | `<ng-container menuRoot>` with `<button menuTrigger>` inside it |
| the state | `className` / `style` as functions of `{ orientation, disabled, modal }` | through `data-*` or the `render` slot (`{ props, state }`) | through `data-*` or the directive's `state()` signal |
| the parent-bar contract (no public API) | a React context in `components/menu/` (`menu-bar-context.ts`), provided by `Menubar` | a `provide` / `inject` key in `components/menu/` (`menu-bar-context.ts`), provided by `Menubar` | an `InjectionToken` in the menu entry (`packages/angular/menu/utils/menu-bar.ts`), provided by `[menubar]`, injected optionally by `[menuRoot]` and `[menuTrigger]` |

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Menubar | `role="menubar"`, `aria-orientation` (`"horizontal"` or `"vertical"`), `data-orientation`, `data-disabled` while disabled; with `modal`, the structural inline style `pointer-events: auto` ("Modal"). Its name is the consumer's (`aria-label`, `aria-labelledby`) |
| Menu.Trigger (in a bar) | `role="menuitem"` (APG: the bar's items are `menuitem`s; the element stays a `button`), the roving `tabindex` (`"0"` on the bar's tab stop, `"-1"` on every other item), `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open, `data-popup-open` while its menu is open, an `id`; disabled: `aria-disabled="true"` and `data-disabled`, **never the native `disabled`** ("Disabled items") |
| Menu's other parts | as [menu.md](menu.md#state-attributes-and-aria): the popup is a `menu` labelled by its Trigger |

## Disabled items

APG: "Disabled menu items are focusable but cannot be activated", and the bar's items are menu
items. A disabled `Menu.Trigger` in a bar (its `disabled`, or the bar's) is `aria-disabled="true"`
with `data-disabled`: the arrows, Home and End reach it and it may hold the tab stop, but no key,
press or hover opens its menu, and the consumer's click handler does not run. Moving to it from an
open menu closes that menu and opens none. A whole disabled bar is still one tab stop.

## Keyboard

On an item of the bar (a `Menu.Trigger`):

| key | horizontal | vertical |
| --- | --- | --- |
| Tab, Shift+Tab | enter the bar at its tab stop, leave it (one tab stop); a menu of the bar left open closes (reason `focus-out`) | same |
| next item | ArrowRight (ArrowLeft in RTL) | ArrowDown |
| previous item | ArrowLeft (ArrowRight in RTL) | ArrowUp |
| Home / End | the first / last item | same |
| open its menu on the first item | ArrowDown, Enter, Space | ArrowRight (ArrowLeft in RTL), Enter, Space |
| open its menu on the last item | ArrowUp | (none) |

- **Moving while a menu is open** (APG, recommended): when a menu of the bar is open and the next,
  previous, Home or End key moves the focus to another item, that menu closes and the new item's
  menu opens, **with the focus kept on the new item** (no item of its menu highlighted); both
  changes report reason `list-navigation`. A disabled item opens nothing.
- **An item whose menu is open and that has the focus** (it got there by the moves above): the open
  keys move the focus into its menu, on the first item (the last for ArrowUp); they open nothing
  again. Escape closes the menu (reason `escape-key`) and the focus stays on the item.
- The arrows of the other orientation do nothing; an arrow, Home or End with Alt, Control, Meta or
  Shift is left to the item. The bar has no typeahead (the APG's is optional).
- Enter and Space report `trigger-press`, the arrows `list-navigation` (Menu's reasons).

In a menu opened from the bar (every key is [Menu's](menu.md#keyboard), plus):

| key | horizontal bar | vertical bar |
| --- | --- | --- |
| the bar's next key (ArrowRight, ArrowLeft in RTL), on an item that opens no submenu, at any level | closes every level, moves the focus to the next item of the bar and opens its menu with the focus kept on that item (APG) | (Menu's: nothing) |
| the bar's previous key (ArrowLeft, ArrowRight in RTL), in a menu of the bar itself | closes it, moves the focus to the previous item of the bar and opens its menu, focus on that item (APG) | closes it and focuses its item (the menu sits at the item's end side, as a submenu; reason `list-navigation`) |
| the previous key in a submenu | Menu's: closes the submenu and focuses its SubmenuTrigger | Menu's |
| the open key on a SubmenuTrigger | Menu's: opens the submenu | Menu's |
| Escape | Menu's: closes the current level; the root level gives the focus back to its item of the bar | same |
| Tab, Shift+Tab | Menu's: closes every level; the focus moves to the next / previous tabbable element after / before the bar (the other items are `tabindex="-1"`) | same |

The moves wrap with `loopFocus` as the bar's own arrows do; without it, the key at an end does
nothing. Every move reaches the DOM within the event (AGENTS.md, "Porting a component", item 8):
a quick second key reaches the newly focused item.

## Focus

A roving tab stop (APG menubar, as [toolbar.md](toolbar.md#focus)): exactly one item has
`tabindex="0"`. Focus enters the bar on its first item; once an item had focus (an arrow, a press,
a script, Escape returning to it, a hover switch), it keeps the tab stop and Tab back into the bar
returns to it. On a server render, before the items are known, every item has `tabindex="-1"`;
once mounted the first one holds the tab stop.

The menus' focus is Menu's ([menu.md, "Focus"](menu.md#focus)): a keyboard opening highlights the
first or last item, a pointer opening focuses the popup with no item highlighted, Escape and an
item's activation return the focus to the menu's item of the bar. The one addition is the moves
between menus above, which keep the focus on the bar's item.

## Pointer

- A press on an item toggles its menu (Menu's, reason `trigger-press`); a press on another item
  while a menu is open closes it as an outside press (Menu's) and opens the pressed one.
- **Hover switching** (Base UI): while a menu of the bar is open, the pointer entering another
  item that is not disabled closes that menu and opens the hovered item's at once (no delay), as a
  pointer opening (the popup focused, no item highlighted); both report reason `trigger-hover`.
  The hovered item becomes the tab stop. With no menu open, hovering opens nothing.
- **The press that follows a hover opening keeps it** (Base UI's patient click, as NavigationMenu's
  [navigation-menu.md](navigation-menu.md#pointer)): a press on an item within 500 ms after the
  hover opened its menu leaves the menu open; a later press closes it.
- Inside the menus, the pointer is Menu's (hover highlights, the submenu's safe area).

## Modal

Non-modal by default (the APG menubar has no modal mode; Menu's D4 §3 rule). With `modal`, each
menu of the bar is modal while open ([menu.md, "Modal"](menu.md#modal)): the page does not scroll
and an outside press reaches nothing (it closes the menu and the focus returns to its item). The
**bar** takes the pointer back (`pointer-events: auto` on the Menubar, structural inline style,
set while `modal`): hover switching and a press on another item work while a menu is open (Base
UI: the bar is outside the modal backdrop). The keyboard is unchanged.

## Dismissal and layering

Each menu is Menu's: a layer of the nested overlay tree, with its submenus as child layers. The
bar itself is no layer. A move to another menu (the keys, the hover) closes the open menu, whose
submenus close with it (reason `none`, the overlay tree), and opens the next one.

## Positioning

A menu of a horizontal bar opens below its item (`side="bottom" align="start"`); of a vertical bar
at its end side (`side="inline-end" align="start"`, to the right in LTR, to the left in RTL), as a
submenu. Every other rule is [popover.md](popover.md#positioning)'s (`data-side` says where it
ended up).

## Animation

None of its own; the menus' are Menu's.

## RTL

In a horizontal bar, ArrowLeft moves to the next item and ArrowRight to the previous one, in the
bar and in its menus (the menus' submenu keys swap as Menu's do). A vertical bar opens its menus to
the left, with ArrowLeft, and ArrowRight closes them. The direction is the
[DirectionProvider](direction.md)'s, else the bar's computed `direction`.

## Scenarios

### `/menubar/basic`

An application's menu bar. A button **"Before"**; a Menubar labelled **"Application"**
(`aria-label`) holding four `Menu.Root`s, each a Trigger and a Portal, Positioner
(`sideOffset={4}`) and Popup:

- **"File"**: the Items **"New"** and **"Open"**, a SubmenuRoot whose SubmenuTrigger **"Share"**
  opens a submenu with the Items **"Email"** and **"Link"**, a Separator, and the Item
  **"Print"**;
- **"Edit"**: the Items **"Undo"**, **"Redo"** (`disabled`), **"Cut"** and **"Copy"**;
- **"View"**: a CheckboxItem **"Show toolbar"** (`defaultChecked`), a CheckboxItem **"Show status
  bar"**, a Separator, and a Group labelled by the GroupLabel **"Theme"** holding a RadioGroup
  (`defaultValue` `"light"`) with the RadioItems **"Light"** (`light`) and **"Dark"** (`dark`);
  each checkable item renders its indicator (`✓`, `•`) before its label, as `/menu/checkbox-radio`;
- **"Help"**, a `disabled` Trigger, with the Item **"About"**;

then a button **"After"**. Clicking an item prints it. Output: `menu: <the name of the open menu,
or none>` (each Root's `onOpenChange` sets it to its Trigger's text when it opens, and back to
`none` when the open one closes), `reason: <the last reason any menu reported>`, `action: <the
last item clicked, or none>`, `toolbar: <true|false>`, `status bar: <true|false>`, `theme:
<value>` (starting `menu: none`, `reason: none`, `action: none`, `toolbar: true`, `status bar:
false`, `theme: light`).

Checks:

1. A `menubar` named "Application" with `aria-orientation="horizontal"`, whose items are the
   `menuitem`s "File", "Edit", "View" and "Help", each with `aria-haspopup="menu"` and
   `aria-expanded="false"`; "Help" has `aria-disabled="true"`.
2. One tab stop: Tab from "Before" focuses "File"; Tab again focuses "After"; Shift+Tab comes back
   to "File". Exactly one item has `tabindex="0"`.
3. Focused on "File": ArrowRight → "Edit" → "View" → "Help" (disabled, reachable) → wraps to
   "File"; ArrowLeft wraps to "Help"; Home → "File"; End → "Help". No menu opened (`menu: none`).
   The item that last had focus keeps the tab stop: focused on "View", Tab goes to "After" and
   Shift+Tab comes back to "View".
4. On "File", ArrowDown opens a `menu` named "File" with "New" focused (`menu: File`, `reason:
   list-navigation`); Escape closes it (`reason: escape-key`) and focuses "File". ArrowUp opens it
   with "Print" focused; Escape. Enter opens it with "New" focused (`reason: trigger-press`);
   Escape; Space does the same.
5. Moving between menus from inside a menu: open "File" with ArrowDown, then ArrowRight on "New":
   File's menu closes, "Edit" is focused and a `menu` named "Edit" is open (`menu: Edit`, `reason:
   list-navigation`) with no item highlighted; ArrowDown focuses "Undo"; ArrowLeft from "Undo"
   closes it, focuses "File" and opens File's menu (`menu: File`).
6. Moving between menus from the bar: with File's menu open and "File" focused (check 5's end),
   ArrowRight focuses "Edit" and opens Edit's menu (`menu: Edit`), the focus staying on "Edit";
   ArrowUp then focuses "Copy" (the last item). Escape closes Edit's menu and focuses "Edit". With
   File's menu open and "File" focused, ArrowLeft wraps to "Help": File's menu closes and none
   opens (`menu: none`), "Help" focused.
7. Submenus inside the bar: open "File", ArrowDown to "Share", ArrowRight opens a `menu` named
   "Share" with "Email" focused; ArrowLeft closes only the submenu ("Share" focused, File's menu
   open); ArrowRight again, then ArrowRight on "Email": every level closes, "Edit" is focused and
   Edit's menu is open (`menu: Edit`). Open "File" again, to "Share", ArrowRight, Enter on "Link":
   `action: Link`, every level closes (`reason: item-press`), focus on "File".
8. Checkable items inside the bar: open "View" with ArrowDown; ArrowDown to "Show status bar",
   Space: `status bar: true`, the menu stays open; ArrowDown to "Dark", Space: `theme: dark`; Home,
   Enter on "Show toolbar": `toolbar: false`, the menu closes (`reason: item-press`) and "View" is
   focused.
9. Tab: open "File" with ArrowDown, Tab: the menu closes (`reason: focus-out`) and "After" is
   focused. With Edit's menu open from a move (focus on "Edit", check 6), Tab closes it (`reason:
   focus-out`) and focuses "After".
10. Pointer: click "File": its menu opens (`reason: trigger-press`), the popup focused with no item
    highlighted; hover "Edit": File's menu closes and Edit's opens (`menu: Edit`, `reason:
    trigger-hover`); hover "View": View's opens; hover "Help" (disabled): View's stays open; click
    "View" at once: it stays open (`menu: View`); after 600 ms, click "View" again: it closes
    (`menu: none`, `reason: trigger-press`). With no menu open, hovering "File" opens nothing.
11. Non-modal: click "File", then click "After": the menu closes (`reason: outside-press`) and
    "After" is focused.
12. "Help" opens nothing: ArrowDown, Enter and Space on it, and a click, leave `menu: none`.
13. Axe finds no violation, with every menu closed and with File's menu open.

### `/menubar/basic?dir=rtl`

The basic page right to left.

Checks:

1. Focused on "File": ArrowLeft → "Edit", ArrowRight → "File", ArrowRight wraps to "Help"; Home →
   "File"; End → "Help".
2. Open "File" with ArrowDown; ArrowLeft on "New" closes it, focuses "Edit" and opens Edit's menu
   (`menu: Edit`); ArrowRight on the focused "Edit" focuses "File" and opens File's menu.
3. In File's menu, ArrowDown to "Share", ArrowLeft opens the submenu, which ends at or before the
   start edge of "Share" (to its left); ArrowRight closes it.

### `/menubar/vertical`

A Menubar labelled **"Tools"**, `orientation="vertical"`, `loopFocus` `false`, holding the menus
**"Shapes"** (Items **"Rectangle"**, **"Ellipse"**) and **"Arrange"** (Items **"Bring forward"**,
**"Send backward"**), each Positioner with `sideOffset={4}`; then a button **"After"**. Output as
in basic (`menu`, `reason`, `action`).

Checks:

1. A `menubar` named "Tools" with `aria-orientation="vertical"`.
2. Tab from the page start focuses "Shapes"; Tab again focuses "After".
3. Focused on "Shapes": ArrowDown → "Arrange"; ArrowDown stays on "Arrange" (no loop); ArrowUp →
   "Shapes"; ArrowUp stays; End → "Arrange"; Home → "Shapes". No menu opened (`menu: none`).
4. ArrowRight on "Shapes" opens a `menu` named "Shapes" with "Rectangle" focused (`reason:
   list-navigation`), its popup starting at or after the end edge of "Shapes" (to its right);
   contract layer: its positioner has `data-side="inline-end"`.
5. ArrowLeft in Shapes' menu closes it (`menu: none`) and focuses "Shapes"; ArrowRight on
   "Rectangle" (an item with no submenu) does nothing: the menu stays open, "Rectangle" focused.
6. Enter on "Arrange" opens its menu with "Bring forward" focused; Enter on it prints `action:
   Bring forward`, closes the menu and focuses "Arrange".
7. Axe finds no violation with Shapes' menu open.

### `/menubar/modal`

The page is taller than the viewport. A Menubar labelled **"Document"** with `modal`, holding the
menus **"File"** (Items **"Save"**, **"Close"**) and **"Edit"** (Item **"Undo"**); after it a
button **"Outside button"** whose click prints `outside: pressed`. Output: `menu: ...`, `reason:
...`, `action: ...`, `outside: ...` (`none` until pressed).

Checks:

1. Click "File": its menu opens; the mouse wheel over the page does not scroll it.
2. The bar still takes the pointer: hover "Edit": File's menu closes and Edit's opens (`menu:
   Edit`, `reason: trigger-hover`).
3. Click "Outside button": the menu closes (`reason: outside-press`), the press reached no element
   (`outside: none`, "Outside button" is not focused) and the focus is on "Edit".
4. Once closed, the page is back: clicking "Outside button" prints `outside: pressed`, and the
   wheel scrolls the page.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Menubar is modal by default (`modal` `true`) | **non-modal by default** (the APG menubar is non-modal, as Menu's D4 §3 rule); `modal` opts in |
| Base UI's disabled menubar trigger is natively disabled (skipped by the arrows) | `aria-disabled="true"` and focusable (the APG: disabled menu items are focusable but cannot be activated) |
| Base UI moves between menus by focusing the next trigger, whose focus opens its menu | the same result through the bar's keys (the focus stays on the item, APG); a focus that comes from elsewhere (a click, a script) opens nothing |
| Base UI marks the bar `data-has-submenu-open` while a menu is open, and `data-modal` | not offered (each menu's Trigger carries `data-popup-open`; `modal` is the consumer's own prop) |
| Base UI opens a bar's menu on `mousedown` and toggles it on `click` once open | a click toggles it (Menu's Trigger), with the patient click after a hover opening |
