# HoverCard

## Purpose

A preview of the content behind a link, shown while the link is hovered or keyboard-focused
(Base UI's PreviewCard; the APG has no pattern for it). Sighted pointer and keyboard users get a
glance without leaving the page; the link itself stays the way to the content, so the card holds
nothing a reader needs that the link's destination does not have. It is not modal, never takes
focus when it opens, and stays open while hovered (WCAG 1.4.13, hoverable content). A short
description of a control is a [Tooltip](tooltip.md); an interactive panel opened by a press is a
[Popover](popover.md).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none | | holds the state |
| Trigger | `a` | `hover-card-trigger` | the link, and the anchor |
| Portal | none | | |
| Backdrop | `div` | `hover-card-backdrop` | optional; behind the popup, takes no pointer |
| Positioner | `div` | `hover-card-positioner` | positions the popup next to the trigger |
| Popup | `div` | `hover-card-popup` | the card |
| Arrow | `div` | `hover-card-arrow` | optional |

## API

**Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)` (an `OpenChangeDetails`,
[README](README.md#open-change-details)), `onOpenChangeComplete(open)`, the actions (`close()`,
`unmount()`; React `actionsRef`), `delay` (`600`, ms before a hovered or focused trigger opens
it), `closeDelay` (`300`, ms before it closes once the pointer left the trigger and the card),
`handle`, `triggerId` / `defaultTriggerId`; its content may be a function of the active trigger's
`payload`.

**Trigger**: `handle`, `payload`, `id` (as [Dialog's](dialog.md#api)); the link's own `href` and
content.

**createHandle**: `createHoverCardHandle<Payload>()` (React and Vue also `HoverCard.createHandle`).

**Portal**: `container`, `keepMounted` (`false`; [README](README.md#lifecycle)).

**Positioner**: as [Popover's](popover.md#api); defaults `side="bottom" align="center"`,
`sideOffset` `0`.

**Popup**, **Backdrop**, **Arrow**: no prop of their own.

Change reasons (spec/README.md): `trigger-hover` (the pointer entered or left the trigger or the
card), `trigger-focus` (keyboard focus entered or left the trigger), `focus-out` (focus left the
card for an element outside it and its triggers), `escape-key`, `outside-press`,
`imperative-action`, `none`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `data-popup-open` on the active trigger while open (Base UI's name), an `id`; no ARIA of its own (the link is the content's way in) |
| Backdrop | `role="presentation"`, `pointer-events: none` (structural inline style), `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`; `hidden` while closed and kept mounted |
| Positioner | as Popover's (`role="presentation"`, `data-side`, `data-align`, `data-open` / `data-closed`, CSS variables; `hidden` while kept mounted and closed) |
| Popup | an `id`, `tabindex="-1"` (a press inside it keeps it open), `data-side`, `data-align`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-instant` when it opened with no delay (a move to another trigger) |
| Arrow | `aria-hidden="true"`, `data-side`, `data-align`, `data-open` / `data-closed` |

The Popup has no role (Base UI): it is supplementary content of the link, not a dialog and not a
description.

## Keyboard and focus

| event | action |
| --- | --- |
| keyboard focus on the Trigger (`:focus-visible`) | opens after `delay` (reason `trigger-focus`); focus stays on the link |
| blur of the Trigger | closes at once (reason `trigger-focus`), unless focus moved into the card |
| focus leaving the card for an element outside it and its triggers | closes (reason `focus-out`) |
| Escape while open | closes (reason `escape-key`); focus stays where it was; an enclosing layer stays open |

Focus never moves into the card when it opens (not modal). A focus by a pointer press does not open
it. Enter on the Trigger follows the link.

## Pointer

- The pointer entering the Trigger (mouse or pen) opens it after `delay` (reason
  `trigger-hover`); leaving before then cancels.
- Leaving the Trigger closes it after `closeDelay`, unless the pointer reaches the card first:
  **the card stays open while hovered** (WCAG 1.4.13), and closes `closeDelay` after the pointer
  left both. Crossing the gap between them inside the **safe area** (the hover bridge,
  `@fragiola/primitives/pointer`, `trackHoverBridge`) keeps it open; the pointer leaving the
  document counts as leaving both (`watchPointerExit`).
- The hover intent and the hover bridge are Tooltip's (`@fragiola/primitives/hover`,
  `createHoverIntent`; `/pointer`), shared through the toolkit.
- **Touch**: a tap never opens it (`pointerType` `touch` is ignored): the tap follows the link.

## Detached triggers

As [Tooltip's](tooltip.md#detached-triggers) ([README](README.md#detached-triggers)): each
Trigger with the Root's `handle` (or inside the Root) opens it with its `payload`; while it is
open, hovering or focusing **another** of its Triggers moves it there **at once**
(`data-instant`, `onOpenChange(true, details)` with the new `trigger`), and the previous one loses
`data-popup-open`.

## Dismissal and layering

The open card is a non-modal layer of the nested overlay tree
([README](README.md#the-nested-overlay-tree)): an outside press closes it (reason
`outside-press`) and keeps focus where the press put it; Escape closes it before any enclosing
layer (`/hover-card/in-dialog`). Its Trigger is part of the layer (a press on it is not outside).

## Positioning

As [popover.md](popover.md#positioning), from the Trigger; it flips and shifts the same way.

## Animation

As [popover.md](popover.md#animation). `keepMounted`, `onOpenChangeComplete` and the actions as
[README](README.md#lifecycle).

## RTL

`inline-start` / `inline-end` follow the trigger's direction, as Popover's.

## Scenarios

### `/hover-card/basic`

A button **"Before"**, then a paragraph "Written by " followed by a HoverCard whose Trigger is a
link **"@ada"** (`href="#ada"`); Root `delay` `500`, `closeDelay` `200`. Its Positioner
(`sideOffset` `8`) and Popup hold the card: the text **"Ada Lovelace"**, the text
**"Mathematician and writer"** and a link **"View profile"** (`href="#ada-profile"`), with an
Arrow. Output: `open: ...`, `reason: ...`.

Checks:

1. Hovering "@ada": nothing at once; after at least 450 ms the card "Ada Lovelace" is visible.
2. Moving the pointer straight down onto the card, across the gap, keeps it open; leaving both
   closes it, not before about 150 ms (`reason: trigger-hover`).
3. Tab from "Before" to "@ada": focus stays on the link; the card opens after at least 450 ms
   (`reason: trigger-focus`); Escape closes it (`reason: escape-key`), focus still on "@ada";
   Tab again from "Before" opens it, and Shift+Tab (blur) closes it at once.
4. Open by hover, then a press outside: it closes (`reason: outside-press`).
5. A press on the card's text keeps it open; a click on "View profile" follows that link.
6. A touch tap on "@ada" opens no card (checked after the delay has passed).
7. Axe finds no violation while open.

### `/hover-card/detached`

Two Triggers with the `handle` of one Root (`delay` `300`), which sits after them: **"@ada"**
(`id="ada"`, `payload` `"Ada"`) and **"@grace"** (`id="grace"`, `payload` `"Grace"`), in a row
with a gap. The Root's content is a function of the payload: a Backdrop, a Positioner and a Popup saying
**"Profile of <name>"** (one text node). Output: `open: ...`, `reason: ...`, `trigger: <id or
none>`.

Checks:

1. Hovering "@ada" opens, after the delay, the card "Profile of Ada" below it; `trigger: ada`.
2. Moving the pointer straight to "@grace": within 200 ms (less than the delay) the card says
   "Profile of Grace" and sits below "@grace"; only "@grace" has `data-popup-open`; `trigger:
   grace`; one card.
3. While open, the Backdrop is rendered (`role="presentation"`, `data-open`) and takes no pointer;
   moving the pointer away closes it (`open: false`).

### `/hover-card/in-dialog`

A [Dialog](dialog.md) Trigger **"Open dialog"**; its popup has Title **"Credits"**, a HoverCard
whose Trigger is a link **"@ada"** (`href="#ada"`, Root `delay` `0`) and whose card says **"Ada
Lovelace"**, and a Close **"Close"**.

Checks (the card is a child layer of the dialog):

1. Open the dialog, Tab to "Close", Shift+Tab back to "@ada": the card opens.
2. Escape closes the card only: the dialog stays open, focus on "@ada".
3. Escape again closes the dialog.

### `/hover-card/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a HoverCard (`delay` and
`closeDelay` `0`) whose Trigger is a link **"@ada"** (`href="#ada"`) and whose card says **"Ada Lovelace"**, its
Portal with `keepMounted` (the Positioner is the kept-mounted part). The checks open it by
hovering "@ada"; an outside press closes it.

## Differences from Base UI

Measured against Base UI 1.9 (`references/base-ui`, `PreviewCard`).

| difference | decision |
| --- | --- |
| Base UI's `delay` and `closeDelay` are Trigger props | **Root props**, as this library's Tooltip; detached triggers share them |
| Base UI's PreviewCard has its own Viewport part (for switching content) | out of scope (the Issue's anatomy) |
| The Issue asks to share "the delay group" with Tooltip | the hover intent and the hover bridge are shared through the toolkit; a HoverCard has **no delay group**, since PreviewCard has no Provider to hold one (one card per Root; a move between its own triggers is instant) |
| Base UI closes on blur through its focus interaction | the same, plus `focus-out` when focus leaves the card itself (Base UI's floating focus rules), so a keyboard user leaving the card's link closes it |

The hover and focus delays, the safe area, the non-modal layer, Escape, the outside press, touch,
the Backdrop and the detached triggers match.
