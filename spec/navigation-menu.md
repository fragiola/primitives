# NavigationMenu

## Purpose

A **site's navigation**: a list of links and of triggers that disclose panels of more links (a
mega menu), opened by a hover or a press, with **one shared popup** whose size animates between
the panels. It is the APG **disclosure navigation menu** (`disclosure/examples/disclosure-navigation`):
each trigger is a button with `aria-expanded` that shows its content, the links are plain links,
and nothing takes the `menu` role (a site's navigation is not an application menu). Where the APG
has no rule (the hover, the shared popup and its viewport, the size variables, the activation
direction, nested levels, the parts and names), it follows Base UI's NavigationMenu (D4). An
application menu of commands is a [Menu](menu.md).

NavigationMenu has its own entry (`/navigation-menu`), built on no other component: the toolkit's
`/overlay` (the layer of the nested overlay tree), `/positioning`, `/hover`, `/pointer` (the hover
bridge), `/focus`, `/collection` (the activation direction, list navigation) and `/presence`.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `nav` (a nested Root: `div`) | `navigation-menu-root` | holds the open item's value; the app names it (`aria-label`) |
| List | `ul` | `navigation-menu-list` | the items; the arrow keys move between them |
| Item | `li` | `navigation-menu-item` | one item: a Trigger with its Content, or a Link |
| Trigger | `button` | `navigation-menu-trigger` | opens its item's Content |
| Icon | `span` | `navigation-menu-icon` | decorative, inside a Trigger (a chevron the recipe draws) |
| Content | `div` | `navigation-menu-content` | its item's panel; rendered into the Viewport while its item is open |
| Link | `a` | `navigation-menu-link` | a link, in the List or in a Content |
| Portal | none | | moves Backdrop and Positioner to the end of `body` while a Content is open |
| Backdrop | `div` | `navigation-menu-backdrop` | optional; covers the page while open |
| Positioner | `div` | `navigation-menu-positioner` | places the Popup next to the open item's Trigger |
| Popup | `div` | `navigation-menu-popup` | the shared popup, its size the open Content's |
| Viewport | `div` | `navigation-menu-viewport` | inside the Popup: where the Contents render |
| Arrow | `div` | `navigation-menu-arrow` | optional; points at the Trigger |

A **nested** NavigationMenu is a Root inside a Content (Base UI): its own List, Items, Triggers,
Contents and Portal, whose popup is a child layer of the parent's (the overlay tree).

## API

**Root**: `value` / `defaultValue` (`null`: closed) / `onValueChange(value, details)` (the open
item's value, a string or `null`; `details` is `{ reason, event }`, not cancelable: a value
change, spec/README.md), `delay` (`50`: ms before a hover opens), `closeDelay` (`50`: ms before the
pointer leaving closes), `orientation` (`"horizontal"`; a nested Root's is usually
`"vertical"`), `loopFocus` (`true`: the arrow keys wrap).

**Item**: `value` (a string; generated when not given).

**Trigger**: `disabled`.

**Link**: `active` (`false`): the link of the current page.

**Positioner**: `side` (`bottom`), `align` (`center`), `sideOffset`, `alignOffset`,
`collisionPadding` (the normalized positioning props).

**Portal**: `container`. **List**, **Icon**, **Content**, **Backdrop**, **Popup**, **Viewport**,
**Arrow**: nothing beyond the contract.

The reasons: `trigger-hover` (the pointer entered a Trigger, or left the Trigger and the popup),
`trigger-press` (a press or Enter / Space on a Trigger), `list-navigation` (the open key on a
Trigger), `escape-key`, `outside-press`, `focus-out`, `none` (the parent level closed, or a
programmatic change).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-orientation`; the app's `aria-label` |
| List | `data-orientation` |
| Trigger | `type="button"`, `aria-expanded` (`"true"` while its item is open), `aria-controls` (its Content's id, while open), `data-popup-open` while its item is open, `data-disabled`, `disabled` |
| Icon | `aria-hidden="true"`, `data-popup-open` while its item is open |
| Content | an `id`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, **`data-activation-direction`** (`left`, `right`, `up`, `down` or `none`: where its Trigger sits from the Trigger open before it, measured on the page, as Tabs', [tabs.md](tabs.md)) |
| Link | `aria-current="page"` and `data-active` when `active` |
| Backdrop | `aria-hidden="true"`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style` |
| Positioner | `role="presentation"`, `data-open` / `data-closed`, `data-side`, `data-align`; the structural inline style of positioning, the anchor's variables (`--anchor-width`, `--available-height`, ...) and **`--positioner-width`**, **`--positioner-height`** |
| Popup | `data-open` / `data-closed`, `data-side`, `data-align`, `data-starting-style`, `data-ending-style`; the inline style **`--popup-width`** and **`--popup-height`** |
| Viewport | none beyond the part attribute |
| Arrow | `aria-hidden="true"`, `data-open` / `data-closed`, `data-side`, `data-align` |

**The size variables.** `--popup-width` and `--popup-height` (and the Positioner's
`--positioner-width` and `--positioner-height`) are the size of the **open Content** in px (its
border box, measured as it renders and whenever it resizes). A recipe sizes the Popup with them
(`width: var(--popup-width)`) and transitions `width` and `height`, and lays the Contents out
absolutely in the Viewport, so the entering and the exiting Content overlap while the popup's
size moves from one to the other. When the menu closes, they keep the last Content's size.

## Keyboard

| key | action |
| --- | --- |
| Tab, Shift+Tab | every Trigger and Link of the List is in the tab order (APG); from an open Trigger, Tab moves into its Content (the first tabbable element), Shift+Tab from the Content's first one back to the Trigger, Tab from its last one to the next tabbable element after the Trigger (the menu stays open: focus is still in the navigation) |
| Enter, Space on a Trigger | toggles its Content (reason `trigger-press`); focus stays on the Trigger (APG) |
| ArrowDown on a Trigger of a horizontal List (ArrowRight of a vertical one, ArrowLeft in RTL) | opens its Content and focuses its first tabbable element (reason `list-navigation`) |
| ArrowRight / ArrowLeft (horizontal; mirrored in RTL), ArrowDown / ArrowUp (vertical) on a Trigger or a Link of the List | moves focus to the next or previous item's Trigger or Link, wrapping with `loopFocus` (the APG's optional arrows; Base UI) |
| Home, End | the first, the last item |
| Escape | closes the open Content (reason `escape-key`) and returns focus to its Trigger when focus was inside it; a nested level closes first |

## Focus

- Opening never moves focus but with the open key (APG: the button keeps focus).
- The Content is in a portal, but in the tab order it comes right after its Trigger (as a
  Popover's popup): Tab from the open Trigger enters it, Tab from its end continues after the
  Trigger.
- Focus leaving the Root and the popup (and its child layers) closes the menu (reason
  `focus-out`). Moving focus between the List's items keeps it open.
- Escape returns focus to the Trigger of the closed Content when focus was inside the popup.

## Pointer

- **Hover** (mouse and pen): the pointer entering a Trigger opens its Content after `delay` (reason
  `trigger-hover`); while a Content is open, entering another Trigger opens that one at once, as a hover opening (the
  pointer leaving closes it; a press within 500 ms keeps it). The
  pointer leaving the Trigger and the popup (the hover bridge between them, as a Tooltip's) closes
  it after `closeDelay`, unless it returned.
- **Press**: a press on a Trigger toggles its Content (reason `trigger-press`). A press within
  500 ms of a hover opening it keeps it open (Base UI's "patient click": the user aimed for it). A
  Content a press opened (or kept open) stays open when the pointer leaves.
- **Touch** opens and closes with a tap only (no hover).
- A press outside the Root and the popup closes it (reason `outside-press`).

## Dismissal and layering

The open popup is a layer of the nested overlay tree ([README](README.md#the-nested-overlay-tree)),
non-modal: Escape closes the newest layer, an outside press closes the layers it is outside of, a
nested level's popup is a child of its parent's (its Trigger is in the parent's Content), and
closing a level closes the levels opened from it (reason `none`). A press on the Root's own List
is inside it (a Trigger toggles its own Content; another Trigger switches).

## Positioning

The Positioner is anchored to the open item's Trigger (`side` `bottom`, `align` `center` by
default), flipping and shifting as a Popover's, and follows the popup's size as it changes.

## Animation

The Popup and the Backdrop enter and exit with `data-starting-style` and `data-ending-style`. A
Content switch keeps the popup open: the new Content enters (`data-starting-style`) while the old
one exits (`data-ending-style`), both with `data-activation-direction`, and the popup's size
variables move to the new Content's size.

## RTL

The arrow keys follow the reading direction (the direction provider, else the computed one):
ArrowLeft moves to the next item of a horizontal List, and a vertical List's open key is
ArrowLeft. `data-activation-direction` stays physical.

## Server rendering

The Root, List, Items, Triggers and Links render on the server; the Portal (and so every Content)
renders nothing until the page is hydrated (README, "Server rendering").

## Scenarios

### `/navigation-menu/basic`

A site header: a Root named **"Main"** (`aria-label`) with a List of three Items:

- **Products** (`value` `"products"`): a Trigger **"Products"** with an Icon, and a Content holding
  a list of three Links **"Analytics"** (`href="#analytics"`, `active`), **"Automation"**
  (`#automation`) and **"Reports"** (`#reports`);
- **Learn** (`"learn"`): a Trigger **"Learn"** with an Icon, and a Content holding a two-column grid
  of four Links **"Guides"**, **"Blog"**, **"Videos"** and **"Community"** (wider and shorter than
  Products');
- a Link **"Pricing"** (`#pricing`).

A Portal holds a Positioner (`sideOffset` `8`), a Popup with an Arrow and a Viewport. After the
Root, a button **"Outside button"**. Output: `value: <the open item, or none>`, `reason: <last
reason>`.

Checks:

1. The Root is a `navigation` named "Main"; the Triggers have `aria-expanded="false"` and no
   `aria-controls`.
2. Hovering "Products" opens its Content after the delay (`value: products`, `reason:
   trigger-hover`); "Products" has `aria-expanded="true"` and `aria-controls` naming the Content;
   the Links are visible; "Analytics" has `aria-current="page"`.
3. Moving to "Learn" switches at once (`value: learn`); its Content has
   `data-activation-direction="right"`; back to "Products": `left`.
4. Moving the pointer away closes it after the close delay (`value: none`, `reason:
   trigger-hover`).
5. A click on "Products" opens it (`trigger-press`) and it stays open when the pointer leaves; a
   second click closes it.
6. Keyboard: Tab to "Products", Enter opens it with focus still on "Products"; Tab moves to
   "Analytics"; Shift+Tab back to "Products"; Tab, Tab, Tab, Tab moves past "Reports" to "Learn",
   still open.
7. ArrowRight on "Products" moves focus to "Learn", then "Pricing", then wraps to "Products"; End
   to "Pricing", Home to "Products".
8. ArrowDown on "Products" opens it (`list-navigation`) with focus on "Analytics"; Escape closes it
   (`escape-key`), focus on "Products".
9. Opened, a press outside closes it (`outside-press`); Tab from "Pricing" to "Outside button"
   closes it (`focus-out`).
10. RTL (`?dir=rtl`): ArrowLeft on "Products" moves to "Learn"; hovering "Products" then "Learn"
    (to its left) gives `data-activation-direction="left"`.
11. Contract layer: the Popup's `--popup-width` and `--popup-height` are the open Content's size in
    px (Products', then Learn's after a switch), the Positioner's `--positioner-width` and
    `--positioner-height` the same; the parts carry their state attributes.
12. Axe finds no violation, closed and open.

### `/navigation-menu/nested`

The Root **"Main"** with an Item **Products** whose Content holds a **nested** NavigationMenu
(`orientation` `"vertical"`): its List has an Item **Developers** (a Trigger **"Developers"** with
an Icon, and a Content with the Links **"API"** and **"SDKs"**) and a Link **"Teams"**; its Portal
holds a Positioner (`side` `inline-end`, `sideOffset` `8`) with a Popup and a Viewport. Then an
Item with the Link **"Pricing"**. Output: `value`, `nested: <the nested open item, or none>`.

Checks:

1. Click "Products", then "Developers": both open (`value: products`, `nested: developers`); "API"
   is visible.
2. Escape closes only the nested level (`nested: none`), focus on "Developers"; Escape again closes
   the menu, focus on "Products".
3. In the nested List, ArrowDown moves from "Developers" to "Teams"; ArrowRight on "Developers"
   opens its Content with focus on "API".
4. With both open, a press outside closes both.
5. Axe finds no violation with both open.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's `--popup-width` / `--popup-height` are the popup's own measured size, written in frames (`auto` at rest) | the **open Content's size**, always in px: a recipe adds the popup's padding and border around it (`box-content`) and lays the Contents out absolutely, which needs no measuring of the popup between frames |
| Base UI's `onValueChange` details are cancelable, with `preventUnmountOnClose`, and the Root has `actionsRef` and `onOpenChangeComplete` | a value change, `{ reason, event }`, not cancelable (spec/README.md: value changes are not cancelable); the lifecycle controls are **out of scope** (Epic #38) |
| Base UI's Link `closeOnClick`, Trigger `nativeButton`, Positioner `collisionAvoidance` / `sticky` / `positionMethod`, `data-instant`, `data-pressed`, Portal `keepMounted` and the inline nested level (List and Viewport without a Portal) | **out of scope** (Epic #38) |
| A press after a hover opening keeps the Content open | as Base UI's patient click, and the Content then stays open when the pointer leaves (a press is a deliberate opening) |

Its own entry, the parts, the reasons, the size variables' names, `data-activation-direction` and
the hover delays follow Base UI.
