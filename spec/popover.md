# Popover

## Purpose

Non-modal floating content anchored to a trigger: a panel the user opens, uses and leaves
(APG: a non-modal `dialog` disclosed by a button). The page stays usable while it is open. Menus
and lists have their own components ([Menu](menu.md), Combobox with its Epic); a description
shown on hover is a [Tooltip](tooltip.md).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state |
| Trigger | `button` | `popover-trigger` | toggles the popover and is its anchor |
| Portal | none | | moves the Positioner to the end of `body` (or a given container) |
| Positioner | `div` | `popover-positioner` | positions the popup next to the anchor |
| Popup | `div` | `popover-popup` | the popover itself |
| Arrow | `div` | `popover-arrow` | points at the anchor; optional |
| Title | `h2` | `popover-title` | names the popover |
| Description | `p` | `popover-description` | describes it |
| Close | `button` | `popover-close` | closes it |

## API

**Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`.

**Trigger**: `disabled`.

**Portal**: `container`.

**Positioner**: `side` (`"bottom"`; one of `top`, `bottom`, `inline-start`, `inline-end`, `left`,
`right`), `align` (`"center"`; `start`, `center`, `end`), `sideOffset` (`0`, px), `alignOffset`
(`0`, px), `collisionPadding` (`8`, px), `anchor` (an element; defaults to the Trigger).

**Popup**: `initialFocus` (element to focus on open; default: the first tabbable element inside,
else the popup itself; `false` moves no focus), `finalFocus` (element to focus when the popover
closes and focus returns; default: the trigger).

The positioning types (`Side`, `Align`) are re-exported as types from the component's entry
(`docs/decisions.md`, "Toolkit re-export").

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (while open), `data-popup-open` while open (Base UI's name, D4 §3 "Naming"), `data-disabled` |
| Positioner | `role="presentation"`, `data-side`, `data-align`, `data-open`; CSS variables `--anchor-width`, `--anchor-height`, `--available-width`, `--available-height`, `--transform-origin`; structural inline style (`position`, `top`, `left`) |
| Popup | `role="dialog"` (no `aria-modal`), `aria-labelledby` / `aria-describedby` when Title / Description exist, `tabindex="-1"`, `data-side`, `data-align`, `data-open`, `data-starting-style`, `data-ending-style` |
| Arrow | `data-side`, `data-align`, `aria-hidden="true"`; structural inline style placing it along the popup's edge |
| Title, Description | an `id` |

## Keyboard

| key | action |
| --- | --- |
| Enter, Space on Trigger | toggles |
| Tab | moves through the popup's content in order; Tab from its last tabbable element (or the popup, when it has none) moves focus to the element after the trigger in the page and closes the popover (reason `focus-out`) |
| Shift+Tab | from the popup's first tabbable element (or the popup), moves focus back to the trigger and closes (reason `focus-out`) |
| Escape | closes (reason `escape-key`) and focuses the trigger; a child layer closes first |

## Focus

- **On open** (D4 §3 "Popover focus on open", a change from the POC): focus moves to
  `initialFocus`, else the **first tabbable element** of the popup, else the popup itself. Reason:
  the APG dialog pattern, "generally, focus is initially set on the first focusable element". The
  POC focused the popup.
- Focus is **not** trapped. In the tab order, the popup's content comes right after the trigger,
  even though it is portalled: Tab from the open popover's trigger enters the popup.
- When focus leaves the popup and its child layers (by Tab, or by clicking a focusable element
  outside), the popover closes (reason `focus-out` or `outside-press`).
- **On close**: Escape, Close and the trigger return focus to `finalFocus`, else the trigger.
  Focus leaving (`focus-out`) moves no focus: it is already where the user put it.
- **After an outside press** (D4 §3 "Popover focus after an outside press", a change from the
  POC, following Base UI since the APG says nothing): focus returns to `finalFocus` (else the
  trigger) **unless the press landed on a focusable element**, which keeps the focus the press
  gave it. The check runs once the press has ended (`@fragiola/primitives/overlay`,
  `returnFocus.whenUnfocused`): focus returns only when the press left it on the body.

## Pointer

- A press on the Trigger toggles (reason `trigger-press`); pressing it while open closes, never
  "outside press then reopen".
- A press outside the popup and its child layers closes (reason `outside-press`); focus then
  follows "After an outside press" above.

## Dismissal and layering

The popover is a layer (see [dialog.md](dialog.md#dismissal-and-layering)). Opened inside another
layer (a Dialog's popup), it is that layer's child: Escape and a press inside the parent close
the popover first ([`/dialog/nested-popover`](dialog.md#dialognested-popover)). No scroll lock, no
inert page.

## Positioning

- The popup sits on `side` of the anchor, aligned by `align`, offset by `sideOffset` /
  `alignOffset`.
- **Sides** (D4 §3 "Naming", Base UI's names): `top`, `bottom`; the logical `inline-start` and
  `inline-end` (`inline-end` is the right in LTR and the left in RTL); the physical `left` and
  `right`, which ignore the direction. The POC's `start` / `end` became `inline-start` /
  `inline-end`.
- **Flip**: when `side` lacks room in the viewport (minus `collisionPadding`), the popup moves to
  the opposite side; `data-side` reports the side it ended up on, named as it was asked (a flipped
  `inline-end` reports `inline-start`, a flipped `right` reports `left`).
- **Shift**: along the cross axis, the popup stays inside the viewport.
- The position follows the anchor on scroll and resize while open.

## Animation

Popup carries `data-starting-style` / `data-ending-style` as in [dialog.md](dialog.md#animation);
the Positioner stays mounted until the popup's exit animations finish. `--transform-origin` points
at the anchor so a scale transition grows from it.

## RTL

`side="inline-start"` / `"inline-end"` and `align="start"` / `"end"` follow the direction of the
anchor's document (`dir`); `left` and `right` do not. Keyboard behaviour does not change.

## Scenarios

### `/popover/basic`

Content: a button **"Open popover"** (Trigger), followed in the page by a button **"After
trigger"**; the popup with Title **"Notifications"**, Description **"You have 3 unread
messages."**, a button **"Mark all as read"** and a Close **"Close"**. Output: `open: ...`,
`reason: ...`.

Checks:

1. Trigger has `aria-haspopup="dialog"`, `aria-expanded="false"`; then `"true"` with
   `aria-controls`.
2. Clicking it shows a non-modal `dialog` named "Notifications" (no `aria-modal`), described by
   "You have 3 unread messages."; focus is on **"Mark all as read"** (its first tabbable element).
3. Tab moves to "Close"; Tab from "Close" moves focus to "After trigger" and closes
   (`reason: focus-out`).
4. Reopen; Shift+Tab from "Mark all as read" moves focus to the trigger and closes
   (`reason: focus-out`).
5. Reopen; Escape closes (`reason: escape-key`) and focuses "Open popover".
6. Reopen; clicking the output (not focusable) closes (`reason: outside-press`) and focus returns
   to "Open popover".
7. Reopen; clicking "After trigger" (focusable) closes (`reason: outside-press`) and focus stays
   on "After trigger".
8. Reopen; clicking "Open popover" closes (`reason: trigger-press`) and does not reopen.
9. Axe finds no violation while open.

### `/popover/initial-focus`

A Trigger **"Share"**; the popup has Title **"Share link"**, a text input labelled **"Link"**
and a button **"Copy"**, in this DOM order, with `initialFocus` set to "Copy".

Checks: on open, focus is on "Copy", not on "Link" (the first tabbable element).

### `/popover/placement`

Popovers with Positioner props, Triggers **"Bottom start"** (`side="bottom" align="start"`),
**"Inline end"** (`side="inline-end"`), **"Left"** (`side="left"`) and **"Flip"**
(`side="bottom"`, its trigger placed at the bottom edge of the viewport). Each popup has Title
"Placed" and no tabbable element.

Checks (geometry, measured with bounding boxes):

1. "Bottom start": the popup's top is below the trigger's bottom, and their left edges are
   aligned (±1 px); focus is on the popup (it has no tabbable element).
2. "Inline end" (LTR): the popup is to the right of the trigger; contract layer:
   `data-side="inline-end"`.
3. "Left": the popup is to the left of the trigger; contract layer: `data-side="left"`.
4. "Flip": the popup is above the trigger; contract layer: `data-side="top"`.

### `/popover/rtl?dir=rtl`

The "Inline end" and "Left" popovers of `/popover/placement` in a document with `dir="rtl"`.

Checks: "Inline end" is to the **left** of the trigger (contract layer:
`data-side="inline-end"`); "Left" is still to the left (physical, contract layer:
`data-side="left"`).

### `/popover/arrow`

A Trigger **"With arrow"** and a popup with an Arrow (the fixture gives it
`data-testid="arrow"`, since it has no role) and Title **"Arrow"**.

Checks: the arrow's centre is horizontally within the trigger's box (±2 px); contract layer:
Arrow has `aria-hidden="true"` and `data-side="bottom"`.

## Differences from Base UI

The POC measured Base UI 1.9 against its spec. With §3's two changes the focus rules now match
Base UI (first tabbable on open; the trigger after an outside press, unless the press focused
something). The flip, shift, sides and arrow placement match. No difference remains.
