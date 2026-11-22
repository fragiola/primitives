# Drawer

## Purpose

A **modal panel that slides in from an edge of the screen** and that the user can **swipe away**:
a bottom sheet, a side panel. It is a [Dialog](dialog.md) (Base UI's Drawer extends its Dialog):
it takes focus, traps it, makes the rest of the page inert, closes on Escape and on a press
outside, and returns focus when it closes. It adds a **swipe to dismiss** along `swipeDirection`,
**snap points** (a bottom sheet resting at preset heights), the CSS variables a recipe moves it
with while it is dragged, and the nested drawer attributes. A panel at an edge that needs no
gesture is a positioned Dialog.

The APG has no drawer pattern: the dialog is the APG modal dialog (`dialog.md`), and the gestures,
snap points, parts and names follow Base UI's Drawer (D4).

Drawer has its own entry (`/drawer`) and is **built on Dialog's parts**, as
[AlertDialog](alert-dialog.md) is: the same Root, Trigger, Portal, Backdrop, Viewport, Popup,
Title, Description and Close, whose part attribute names the component they belong to
(`drawer-popup`), plus its own `Content`. Everything this page does not change is Dialog's: the
nested overlay tree, detached triggers, the open change details, the lifecycle and `keepMounted`
([README](README.md#overlays)). The swipe is the toolkit's `/swipe` entry (`watchSwipe`,
`swipeRelease`, `resolveSnapPoints`), which only Drawer imports: an app with Dialog alone never
bundles it. Its entry is built on Dialog's (`ENTRY_DEPENDENCIES`); Dialog's entry holds none of
Drawer's code.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none (renders no element) | | holds the state, the swipe direction and the snap points |
| Trigger | `button` | `drawer-trigger` | opens the drawer |
| Portal | none | | moves Backdrop, Viewport and Popup to the end of `body` |
| Backdrop | `div` | `drawer-backdrop` | covers the page; optional; a nested one renders nothing unless `forceRender` |
| Viewport | `div` | `drawer-viewport` | optional; a full-page container a recipe places the popup at its edge in |
| Popup | `div` | `drawer-popup` | the dialog; the swipe starts on it |
| Content | `div` | `drawer-content` | optional; a mouse press inside it selects text instead of swiping |
| Title | `h2` | `drawer-title` | names it |
| Description | `p` | `drawer-description` | describes it |
| Close | `button` | `drawer-close` | closes it |

## API

As [Dialog's](dialog.md#api), part by part, with:

- **Root**: `swipeDirection` (`"down"` by default: a bottom sheet; `"up"`, `"left"`, `"right"`),
  the edge a swipe dismisses it towards; `snapPoints` (an array of snap points, below; vertical
  directions only); `snapPoint` / `defaultSnapPoint` / `onSnapPointChange(snapPoint, details)`
  (the active snap point, controlled or not; `details` is `{ reason, event }`, reason `swipe`, or
  `none` when the drawer opens on its default and resets it after closing); `handle` takes a
  Drawer handle. No `modal` prop: a drawer is modal.
- **createHandle**: `createDrawerHandle<Payload>()` (React and Vue also `Drawer.createHandle`),
  with Dialog's methods.
- **Content**: nothing beyond the contract.
- **Popup**: `initialFocus`, `finalFocus` (as Dialog's).

**Snap points** (Base UI's `DrawerSnapPoint`): a number from `0` to `1` is a fraction of the
viewport's height (the Viewport's height, else the window's), a number above `1` a height in px, a
string a height in `px` or `rem` (`"148px"`, `"30rem"`). A snap point is the **height of the popup
shown**: the popup is moved towards its edge by its height minus that height (the snap point's
**offset**), never more than its own height and the viewport's. Points within 1 px of each other
count once. Without `snapPoint` or `defaultSnapPoint`, a drawer with snap points opens on the
first one; it opens on `defaultSnapPoint` again after it closed (uncontrolled).

The open change of a swipe has the new reason **`swipe`** (Base UI's), with the `pointerup` as its
event; its focus return is `close-press`'s (to the active trigger).

## State attributes and ARIA

As [Dialog's](dialog.md#state-attributes-and-aria) (`drawer-*` part attributes), with:

| part | attributes |
| --- | --- |
| Popup | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, `tabindex="-1"`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-nested`, **`data-nested-drawer-open`** (Dialog's `data-nested-dialog-open`, named for the drawer), **`data-swipe-direction`** (`up`, `down`, `left` or `right`), **`data-swiping`** while a swipe moves it, **`data-swipe-dismiss`** once a swipe dismissed it (during its exit), **`data-expanded`** when it shows all of itself (no snap points, or the active snap point's offset is `0`); the structural inline style **`--nested-drawers: <n>`**, **`--drawer-swipe-movement-x`** and **`--drawer-swipe-movement-y`** (the swipe's movement in px, `0px` at rest), **`--drawer-snap-point-offset`** (the active snap point's offset in px, `0px` without snap points), **`--drawer-swipe-progress`** (from `0` to `1`, how far it moved towards closed) |
| Backdrop | as Dialog's, with `data-nested-drawer-open`, `data-swiping` and `--drawer-swipe-progress` |
| Viewport | as Dialog's, with `data-nested-drawer-open` and `data-swiping` |
| Content | none beyond the part attribute |

A recipe moves the popup with the variables: `transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)))`, no transition while `data-swiping`, and an exit towards the edge (`data-ending-style`).

## Keyboard

As Dialog's: Tab and Shift+Tab cycle in the popup, Escape closes it (reason `escape-key`). Snap
points have no keys: the keyboard user reaches all of the content (the popup's own scroll) and
closes it with Escape or Close.

## Focus

As Dialog's: the first tabbable element on open (else the popup), trapped, back to the active
trigger on close (a swipe too).

## Pointer

As Dialog's (a press outside closes it, reason `outside-press`), with the swipe.

### Swipe

A press on the Popup can start a **swipe** (`watchSwipe`), with the mouse, a pen or a touch:

1. **Start.** A primary pointer goes down on the popup, but not on a text control (`input`,
   `textarea`, `select`, an editable element), a range input, or an element marked
   `data-swipe-ignore`; a mouse also not on an interactive element (a button, a link, a label),
   nor inside the **Content** (where the mouse selects text). A touch may swipe from anywhere else,
   buttons and Content included (its tap still activates a button).
2. **Lock.** Once the pointer moved 6 px, the gesture locks: along the axis of `swipeDirection` it
   becomes a swipe (pointer capture, text selection cleared and off); along the other axis, or
   when an element under the pointer would scroll for that move (an element between the target
   and the popup with `overflow: auto | scroll` that is not at its start for a move towards the
   edge, or not at its end for a move away from it: **scroll containment**), it is let go and does
   nothing. A touch that may still become a swipe does not scroll the page.
3. **Move.** While it runs: `data-swiping` on the Popup, Backdrop and Viewport, and the movement in
   `--drawer-swipe-movement-x` / `-y`: towards the edge, as far as the pointer went; away from it,
   as far as the popup is not fully shown, then damped (the square root of the rest). The
   progress (`--drawer-swipe-progress`) is the share of the way to closed.
4. **Release.** Without snap points, it **dismisses** (reason `swipe`, `data-swipe-dismiss`)
   when it moved more than half the popup's size along the direction, or at least 10 px at a
   **flick**'s velocity (0.5 px per ms or faster towards the edge, over its last 100 ms of moves,
   `0` when the pointer rested 80 ms before the release); otherwise it settles back (the movement
   returns to `0px`). With snap points, the release's target is where it was let go plus, at a
   flick's velocity or faster in either direction, a projection of it (velocity × 300 px, at most
   4 px per ms); the closest of the snap points and the closed position wins: a snap point becomes
   active (`onSnapPointChange`, reason `swipe`), or the drawer dismisses. A canceled pointer
   (`pointercancel`) settles back.

A canceled dismissal (`details.cancel()`) leaves the drawer open where it was, settled back.

Tolerances for the tests: a slow drag (5 px per 20 ms) is not a flick; a drag of 70 % of the
size dismisses and one of 25 % settles back; a 60 px move within three events (a few ms) is a
flick.

## Dismissal and layering

As Dialog's: a modal layer of the overlay tree, Escape closes the newest layer only, closing it
closes the overlays opened from it, scroll lock.

## Nested drawers

A Drawer (or Dialog) inside a Drawer's Popup is **nested** ([dialog.md](dialog.md#nested-dialogs)):
the nested one carries `data-nested`, its Backdrop renders nothing unless `forceRender`; the
parent carries `data-nested-drawer-open` and `--nested-drawers: <n>` (the open chain below it). A
swipe on the nested popup moves and dismisses it alone; the parent stays open.

## Detached triggers

As [Dialog's](dialog.md#detached-triggers), with a Drawer handle.

## Positioning

None: the recipe places the popup at its edge (`fixed`, `bottom: 0` for a bottom sheet). The snap
point offset and the swipe movement are CSS variables the recipe adds to its transform.

## Animation

As Dialog's (`data-starting-style`, `data-ending-style`). The recipe's exit moves the popup to
its edge (`data-ending-style` with `data-swipe-direction`), and it runs from where a swipe let it
go (the movement stays while it exits).

## RTL

Nothing changes: `swipeDirection` is physical (`left`, `right`), as Base UI's.

## Scenarios

### `/drawer/basic`

A bottom sheet (`swipeDirection` `"down"`, the default): a Trigger **"Open drawer"**, then a button
**"Outside button"**; a Portal with a Backdrop, a Viewport and a Popup holding a **handle** bar (a
`div` with `aria-hidden="true"` and `data-testid="drawer-handle"`, the place a mouse swipes
from), then a Content with Title **"Notifications"**, Description **"You are all caught up."**, a
list **"Recent"** (`role="list"`, `aria-label="Recent"`, 12 rows **"Notification 1"** to
**"Notification 12"**, scrollable: a fixed height with `overflow-y: auto`, and `tabindex="0"` so the
keyboard reaches it) and a Close **"Close"**.
Output: `open: <true|false>`, `reason: <last reason>`.

Checks:

1. Click "Open drawer": a modal `dialog` named "Notifications" with its description; `open:
   true`, `reason: trigger-press`; focus on the first tabbable element, the list "Recent"; "Outside button" is inert.
2. Escape closes it (`reason: escape-key`), focus on "Open drawer"; a press on the backdrop closes
   it (`outside-press`).
3. A slow mouse drag from the handle down by 70 % of the popup's height: during it the Popup has
   `data-swiping` and `--drawer-swipe-movement-y` the distance; on release it closes with `reason:
   swipe` and focus on "Open drawer".
4. A slow drag down by 25 % settles back: still open, no `data-swiping`, movement `0px`.
5. A fast flick of 60 px down closes it (`swipe`).
6. A drag up (away from the edge) never closes it, and moves it less than the pointer (damped).
7. A mouse drag that starts in the Content (on the Title) does not swipe (text selection).
8. Touch: a slow touch drag down by 70 % from the Title closes it (`swipe`); one by 25 % settles
   back.
9. Scroll containment: with the list scrolled down, a touch drag down on a row scrolls the list
   and the drawer does not move (no `data-swiping`, still open).
10. Axe finds no violation while open.

### `/drawer/side`

A side panel: `swipeDirection` `"right"`, a Trigger **"Open settings"**; a Popup (at the right
edge) with Title **"Settings"**, Description **"Choose what you see."** and a Close **"Done"**.
Output: `open`, `reason`.

Checks:

1. The Popup has `data-swipe-direction="right"`.
2. A slow mouse drag right by 70 % of its width (from the Description) closes it (`swipe`); a drag
   down does nothing (the other axis): no `data-swiping`, still open.
3. A drag left (away from the edge) is damped and never closes it.
4. Axe finds no violation while open.

### `/drawer/snap-points`

A bottom sheet with `snapPoints` `["200px", 1]` and a controlled `snapPoint` (default `"200px"`):
a Trigger **"Open map"**; a Popup of 560 px with Title **"Map"**, Description **"Drag to see
more."**, a Close **"Close"**. Output: `open`, `reason`, `snap: <the active snap point>`.

Checks:

1. Open: `snap: 200px`; the Popup's `--drawer-snap-point-offset` is `360px` (560 − 200), it shows
   its top 200 px above the viewport's bottom edge, no `data-expanded`.
2. A slow drag up by 300 px settles on `1`: `snap: 1`, offset `0px`, `data-expanded`, the popup's
   top at the viewport's bottom minus 560 px.
3. From there, a slow drag down by 250 px settles on `200px` again (`reason` unchanged).
4. From `200px`, a slow drag down by 150 px closes it (`reason: swipe`), closer to closed.
5. Reopened, it is on `200px` (`snap: 200px`).
6. Axe finds no violation while open.

### `/drawer/nested`

A bottom sheet with Title **"Order"**, a Close **"Close order"** and, inside its Popup, a nested
Drawer: a Trigger **"Edit address"** and a Popup with Title **"Address"** and a Close **"Save
address"**. Output: `open` (the outer one), `nested: <true|false>`.

Checks:

1. Open both: the outer Popup has `data-nested-drawer-open` and `--nested-drawers: 1`; the inner
   one `data-nested`; the inner Backdrop renders nothing.
2. Escape closes only the inner one (`nested: false`), focus on "Edit address"; the outer has no
   `data-nested-drawer-open`, `--nested-drawers: 0`.
3. Reopen the inner one; a mouse swipe down on it closes it alone (the outer stays open).
4. Axe finds no violation with both open.

### `/drawer/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a Trigger **"Open
drawer"**; a Portal with `keepMounted` holding a Backdrop and a Popup with Title **"Lifecycle"**,
a button **"Close with actions"** and a Close **"Close"**. The kept-mounted part is the Popup.

Checks: the common checks.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's swipe listens on the Viewport | on the **Popup**: a drawer without a Viewport swipes too, and a press on the Viewport around the popup stays an outside press |
| Base UI dismisses a fast flick from any snap point | the flick's velocity **projects** the release target, and the closest of the snap points and closed wins: a flick from the top of a tall sheet lands on a lower point first |
| Base UI's `Provider`, `Indent`, `IndentBackground`, `SwipeArea` (swipe to open), `VirtualKeyboardProvider`, `snapToSequentialPoints`, `modal={false}`, `disablePointerDismissal`, `data-nested-drawer-swiping`, `--drawer-height`, `--drawer-frontmost-height` and `--drawer-swipe-strength` | **out of scope** (Epic #38): the Epic's swipe, snap points, offsets and nested drawers come first |
| Base UI's swipe ignore attribute `data-base-ui-swipe-ignore` (with an axis value) | **`data-swipe-ignore`**, both axes |

Its own entry, the part attributes named `drawer-*`, the reason `swipe`, `snapPoint` and its
variables and attributes follow Base UI.
