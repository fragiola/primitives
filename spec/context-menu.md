# ContextMenu

## Purpose

A menu of actions opened **from an area of the page**, at the pointer: a right-click (the
`contextmenu` event), a touch long press, or the keyboard's `ContextMenu` key or Shift+F10 (the
`menu` role of the APG; the APG has no context menu pattern of its own, so the opening follows
Base UI and the platforms). Its content is a [Menu](menu.md)'s: items, groups, separators, checkbox
and radio items, submenus. A menu opened by a button is a [Menu](menu.md).

ContextMenu has its own entry (`/context-menu`) and is **built on Menu's parts**: the Portal,
Positioner, Popup, Item, CheckboxItem, RadioGroup, RadioItem, their indicators, Group, GroupLabel,
Separator, SubmenuRoot and SubmenuTrigger are Menu's, whose part attribute names the component
they belong to (`context-menu-item`, read from the Root), as the calendar family's shared parts
are. Only the Root and the Trigger are its own. Its entry is built on Menu's
(`ENTRY_DEPENDENCIES`); Menu's entry holds none of ContextMenu's code. Everything this page does
not change is [menu.md](menu.md)'s.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state of the root menu level |
| Trigger | `div` | `context-menu-trigger` | the area a right-click or a long press opens the menu from; no button |
| Portal | none | | |
| Positioner | `div` | `context-menu-positioner` | places the popup at the point (a virtual anchor) |
| Popup | `div` | `context-menu-popup` | the `menu` |
| Item | `div` | `context-menu-item` | a `menuitem` |
| CheckboxItem, CheckboxItemIndicator | `div`, `span` | `context-menu-checkbox-item`, `context-menu-checkbox-item-indicator` | as [Menu's](menu.md#anatomy) |
| RadioGroup, RadioItem, RadioItemIndicator | `div`, `div`, `span` | `context-menu-radio-group`, `context-menu-radio-item`, `context-menu-radio-item-indicator` | as Menu's |
| Separator, Group, GroupLabel | `div` | `context-menu-separator`, `context-menu-group`, `context-menu-group-label` | as Menu's |
| SubmenuRoot | none | | a nested level, as Menu's |
| SubmenuTrigger | `div` | `context-menu-submenu-trigger` | as Menu's |

A submenu's Portal, Positioner and Popup are the same parts inside the SubmenuRoot; they carry
`data-nested` and the `context-menu-*` part attributes of their root.

## API

**Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)` (an
`OpenChangeDetails`; `trigger` is the Trigger area), `onOpenChangeComplete(open)`, the actions
(`close()`, `unmount()`; React `actionsRef`), `loopFocus` (`true`), `modal` (`false`, as Menu's:
the APG menu is non-modal), `disabled` (`false`: the area opens nothing, and the browser's own
context menu shows). No handle and no `triggerId`: a context menu has one Trigger area.

**Trigger**: nothing beyond the contract (it renders its children: the area's content).

**Portal**: `container`, `keepMounted` (`false`).

**Positioner**: as Menu's, with the defaults `side="bottom" align="start"`, `sideOffset` `0`,
`alignOffset` `0`; the anchor is the **point** that opened the menu (the pointer, or the focused
element for the keyboard), not the Trigger. An `anchor` prop overrides it.

**SubmenuRoot**, **SubmenuTrigger**, **Item**, **CheckboxItem**, **RadioGroup**, **RadioItem**,
the indicators, **Group**, **GroupLabel**, **Separator**: as [Menu's](menu.md#api).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `data-popup-open` while the menu is open, `data-disabled`; no role and no `aria-haspopup` (it is an area, not a button; Base UI); no inline style (the consumer's styles turn off text selection and the system callout of a long press: `user-select: none`, `-webkit-touch-callout: none`) |
| Positioner | as Menu's (`data-open` / `data-closed`, `data-side`, `data-align`; `hidden` while kept mounted and closed) |
| Popup | `role="menu"`, `aria-orientation="vertical"`, `tabindex="-1"`, `data-open` / `data-closed`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style`; **no `aria-labelledby`** (no button names it: the consumer gives the popup an `aria-label`); a submenu's popup is labelled by its SubmenuTrigger and carries `data-nested` |
| the other parts | as Menu's |

## Keyboard

With focus on the Trigger area or on an element inside it:

| key | action |
| --- | --- |
| `ContextMenu` (the menu key) | opens the menu anchored at the focused element, first item highlighted (reason `list-navigation`) |
| Shift+F10 | the same |

The key's own `contextmenu` event (browsers fire one after these keys) does not open the menu a
second time nor show the browser's menu. In the menu, every key is Menu's
([menu.md](menu.md#keyboard)): arrows, Home/End, typeahead, Enter/Space, the submenu keys, Escape
(one level), Tab (closes every level; focus moves to the next / previous tabbable element after /
before the element that had focus when it opened, else the Trigger area).

## Focus

- Opened by the keyboard, the first item is highlighted (focused), as a Menu opened with ArrowDown
  (APG menu). Opened by a pointer (right-click, long press), the popup is focused with no item
  highlighted, as Menu's pointer opening.
- On close by Escape or by an item, focus returns to **the element that had focus when the menu
  opened** (a right-click focuses the focusable element it presses, before the menu opens), when it
  is still in the document and not disabled; else focus is not moved. A close with `none` or
  `imperative-action` returns focus the same way only when focus was left inside the menu.
- An outside press moves no focus (non-modal; as Menu's). With `modal`, focus returns as on
  Escape.

## Pointer

- **Right-click** (the `contextmenu` event) on the area, or on an element inside it: the browser's
  menu is prevented and the menu opens with its popup's corner at the pointer (reason
  `trigger-press`). A right-click on the area while it is open is first an outside press (its
  `pointerdown` closes the menu, reason `outside-press`), then its `contextmenu` opens it again at
  the new point (reason `trigger-press`).
- A `contextmenu` event inside the menu's popups is prevented (no browser menu over the menu) and
  does nothing else.
- **The mouseup that ends the opening right-click activates nothing**: an item activates on a
  click, which the right button never sends; a mouseup alone does nothing.
- **Touch long press** (`@fragiola/primitives/pointer`, `watchLongPress`): a touch held still on
  the area for **500 ms** opens the menu at the press point (reason `trigger-press`). A move beyond
  **10 px** from the start, a release, or a cancel before 500 ms cancels it. The click and the
  `contextmenu` event that follow the release of a long press that opened the menu are ignored (they
  neither activate an item under the finger nor reopen the menu). Mouse and pen long presses do
  nothing (the mouse has its right button).
- Inside the menu, the pointer is Menu's (hover highlights, safe area, a click activates).
- A press outside every level closes them all (reason `outside-press`); a right-click outside the
  area while open closes it (an outside press) and leaves the browser's menu to the page.

## Modal

As [Menu's](menu.md#modal): non-modal by default; `modal` locks the scroll and blocks the outside
pointer while open.

## Dismissal and layering

As Menu's: each level is a layer of the nested overlay tree; Escape closes one level; an outside
press, Tab and item activation close them all. The Trigger area is not part of the menu's layer:
a press on the area outside the popup is an outside press (it closes the menu), and a right-click
on it opens the menu again at the new point.

## Positioning

The root level is anchored to a **virtual anchor** (`@fragiola/primitives/positioning`,
`virtualAnchor`): the zero-size rectangle at the point that opened it (the pointer's client
coordinates), or the focused element's rectangle for the keyboard. With `side="bottom"
align="start"` and no offset, the popup's start corner is at the point; it flips and shifts to stay
in the viewport as any positioned overlay ([popover.md](popover.md#positioning)), and `data-side` /
`data-align` report where it ended up. The point does not follow the page's scroll (the menu
stays where it was opened). Submenus are positioned as Menu's.

## Animation

As [menu.md](menu.md#animation).

## RTL

As Menu's: the submenu keys swap and a submenu opens to the left; `align="start"` follows the
direction, so the popup's start corner (its right edge in RTL) is at the point.

## Scenarios

### `/context-menu/basic`

Content: a Trigger area (`<div class="... h-48 w-96 ...">`) labelled for the reader by its
content: a heading-free text **"Files"** and two buttons **"report.pdf"** and **"notes.txt"**
inside it; after the area, a button **"After area"**. The Popup has `aria-label="File actions"`
and the items **"Open"**, **"Rename"**, a Separator, **"Delete"**, and a SubmenuTrigger
**"Share"** whose submenu has **"Email"** and **"Link"**. Clicking an item prints it. Output:
`open: ...`, `reason: ...`, `action: <last item clicked, or none>`.

Checks:

1. Right-click the area at a point (40 px, 40 px inside its top-left corner): a `menu` named "File
   actions" opens (`reason: trigger-press`) with its top-left corner at the point (±1 px), the
   popup focused, no item highlighted; the browser's menu is prevented (the event's
   `defaultPrevented`).
2. The mouseup of that right-click activated nothing (`action: none`). A right-click on "Open"
   inside the open menu activates nothing either and the menu stays open (its `contextmenu` is
   prevented). A right-click on the area at another point, outside the open popup (300 px, 150 px), moves the menu there
   (`open: true`, `reason: trigger-press`).
3. ArrowDown highlights "Open"; Enter on "Open": `action: Open`, the menu closes
   (`reason: item-press`).
4. Focus "report.pdf", press Shift+F10: the menu opens (`reason: list-navigation`) anchored below
   "report.pdf" (its top at the button's bottom, its start at the button's start, ±1 px) with
   "Open" focused; Escape closes it (`reason: escape-key`) and focus returns to "report.pdf".
5. Focus "notes.txt", press the `ContextMenu` key: the menu opens with "Open" focused, below
   "notes.txt"; the key's `contextmenu` event did not reopen it at another point.
6. Submenu: open with the keyboard, ArrowDown to "Share", ArrowRight: a `menu` named "Share" with
   "Email" focused; Enter on "Link": `action: Link`, every level closes.
7. Right-click "report.pdf" (it takes focus), then Escape: focus is on "report.pdf".
8. Open with a right-click, click "After area": the menu closes (`reason: outside-press`) and
   "After area" is focused.
9. Open with the keyboard, press Tab: the menu closes (`reason: focus-out`) and focus moves to the
   next tabbable element after the one focused when it opened ("notes.txt" after "report.pdf").
10. **Touch** (a touch screen): a long press of 600 ms on the area at a point opens the menu at
    that point (`reason: trigger-press`), and releasing activates nothing (`action: none`); a
    press released after 200 ms opens nothing; a press that moves 30 px before 500 ms opens
    nothing.
11. Axe finds no violation while open.

### `/context-menu/rtl?dir=rtl`

The basic scenario in `dir="rtl"`.

Checks: a right-click at a point opens the popup with its top-right corner at the point (±1 px,
`data-align="start"`); from the keyboard, ArrowLeft on "Share" opens the submenu, which ends at or
before the start edge of "Share" (to its left), and ArrowRight closes it.

### `/context-menu/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a Trigger area with the text
**"Right-click here"** (`<div class="... h-32 w-64 ...">`); a Portal with `keepMounted` holding a
Positioner (the kept-mounted part) and a Popup with `aria-label="Actions"` and the items **"Edit"**
and **"Delete"**. The checks open it with a right-click in the area.

Checks: the common checks (no "Close with actions").

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI opens on the `contextmenu` event only: the `ContextMenu` key and Shift+F10 reach it as the browser's keyboard `contextmenu` event, at the element's corner, with no item highlighted | the keys open it anchored at the focused element **with the first item highlighted** (APG menu: a menu opened from the keyboard focuses its first item) |
| A mouseup 500 ms or more after the opening right-click activates the item under the pointer (press, drag and release), and one elsewhere closes the menu | an item activates on a **click** only, as every Menu item: the mouseup of a right-click activates nothing, and the menu stays open until an item, Escape or an outside press |
| A long press anchors to a 10 × 10 rectangle at the touch point | the point itself (a zero-size anchor), as a right-click |
| The long press is implemented with touch events | pointer events (`watchLongPress`, `pointerType` `touch`), the toolkit's pointer mechanism |
| Focus returns to the Trigger area (focusable through its own tabindex, if any) | to the element focused when it opened, when it still can take focus |
| The popup's `alignOffset` defaults to a small negative value for a root context menu | `0`: the corner at the point |
| The Trigger sets the inline style `-webkit-touch-callout: none` | no inline style: the property is cosmetic for most browsers (Chromium drops it, so a server render and a browser one would differ), and the consumer's styles set it (the recipes do) |
