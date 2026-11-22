# Tooltip

## Purpose

A short description of a control, shown while the control is hovered or keyboard-focused (APG
`tooltip`). It never holds interactive content and never takes focus: what it says is the
trigger's accessible **description** (`aria-describedby`), never its name, so a control still
needs its own name. Rich hover cards and toggletips (a tooltip opened by a click) are out of
scope.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Provider | none | | a delay group: the shared delays, and the instant hand-off between its tooltips |
| Root | none | | holds the state |
| Trigger | `button` | `tooltip-trigger` | the described control, and the anchor |
| Portal | none | | |
| Positioner | `div` | `tooltip-positioner` | positions the popup next to the trigger |
| Popup | `div` | `tooltip-popup` | the `tooltip` |
| Arrow | `div` | `tooltip-arrow` | optional |

## API

**Provider**: `delay` (`600`, ms before a hovered trigger opens its tooltip), `closeDelay` (`0`,
ms before a tooltip closes after the pointer leaves), `timeout` (`400`, ms after a tooltip of the
group closed during which another one opens with no delay).

**Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`, `delay`, `closeDelay`
(each defaults to the Provider's, else the Provider defaults), `disabled`.

**Trigger**: no props of its own.

**Positioner**: as [Popover's](popover.md#api) (the same sides: `top`, `bottom`, `inline-start`,
`inline-end`, `left`, `right`); defaults `side="top" align="center"`, `sideOffset` `0`.

A Root outside any Provider behaves as if alone in its own group.

Change reasons (spec/README.md): `trigger-hover` (the pointer entered or left the trigger or the
popup), `trigger-focus` (keyboard focus entered or left the trigger), `trigger-press` (a press on
the trigger closes it), `escape-key`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `aria-describedby` (the popup's id, while open; added to the consumer's own), `data-popup-open` while open (Base UI's name, D4 §3 "Naming") |
| Positioner | as Popover's (`role="presentation"`, `data-side`, `data-align`, `data-open`, CSS variables) |
| Popup | `role="tooltip"`, an `id`, `data-side`, `data-align`, `data-open`, `data-starting-style`, `data-ending-style`, `data-instant` when it opened with no delay (focus, or the group's hand-off) |
| Arrow | `aria-hidden="true"`, `data-side`, `data-align` |

**The tooltip wires itself** (D4 §3 "Tooltip", keep): the Popup sets `role="tooltip"` and the
Trigger's `aria-describedby` points at it while open. Reason: the APG tooltip pattern; Base UI
leaves both to the consumer.

## Keyboard and focus

| event | action |
| --- | --- |
| keyboard focus on the Trigger (`:focus-visible`) | opens at once (reason `trigger-focus`) |
| blur | closes (reason `trigger-focus`) |
| Escape while open | closes (reason `escape-key`); focus stays on the trigger; the key does not reach an enclosing layer |

Focus never moves into the popup. A focus by a pointer press does not open it.

## Pointer

- The pointer entering the Trigger (mouse or pen) opens it after `delay` (reason `trigger-hover`);
  leaving before then cancels.
- Leaving the Trigger closes it after `closeDelay`, unless the pointer enters the popup
  meanwhile: **the popup stays open while hovered** (D4 §3 "Tooltip", keep; WCAG 1.4.13,
  hoverable content), and closes when the pointer leaves it. While the pointer crosses the gap
  towards the popup, inside the hover bridge between the trigger and the popup
  (`@fragiola/primitives/pointer`, `trackHoverBridge`), it stays open.
- A press on the Trigger closes it (reason `trigger-press`) and it does not reopen until the
  pointer leaves and enters again.
- **Touch**: a tap never opens a tooltip (`pointerType` `touch` is ignored), as Base UI.

## Delay group

Within one Provider, at most one tooltip is open. When the pointer moves from an open tooltip's
trigger to another trigger of the group, the new one opens **at once** (`data-instant`) and the
previous one closes. The hand-off also applies within `timeout` ms after the group's last tooltip
closed; after that, the next one waits for `delay` again.

## Dismissal and layering

The open tooltip is not a layer: it takes no outside press and never closes an enclosing overlay.
Escape closes it and stops there (an enclosing dialog stays open): it takes the key before the
layers do (`@fragiola/primitives/layers`, `interceptEscape`). Scenario
[`/tooltip/in-dialog`](#tooltipin-dialog).

## Positioning

As [popover.md](popover.md#positioning), from the Trigger. It flips and shifts the same way.

## Animation

As [popover.md](popover.md#animation). `data-instant` lets a stylesheet skip the enter transition
for a hand-off.

## RTL

`inline-start` / `inline-end` follow the trigger's direction, as Popover's.

## Scenarios

### `/tooltip/basic`

A button **"Before"**, then a Tooltip whose Trigger is a button **"Save"** and whose popup says
**"Save the document"**, with an Arrow; Root `delay` `500`. Output: `open: ...`, `reason: ...`.

Checks:

1. No `tooltip` at first; "Save" has no description.
2. Hovering "Save": no tooltip right away; after at least 450 ms a `tooltip` "Save the document"
   is visible and "Save" is described by it (accessible description).
3. Moving the pointer onto the popup keeps it open; leaving both closes it (`reason:
   trigger-hover`).
4. Tab from "Before" opens it at once on focus (`reason: trigger-focus`); Escape closes it
   (`reason: escape-key`) with focus still on "Save"; Shift+Tab (blur) leaves it closed.
5. Hover, wait for it, press "Save": it closes (`reason: trigger-press`) and stays closed while the
   pointer stays.
6. A touch tap on "Save" shows no tooltip (checked after the delay has passed).
7. Axe finds no violation while open.

### `/tooltip/group`

A Provider (`delay` `800`, `timeout` `400`) with three Tooltips: Triggers **"Bold"**, **"Italic"**,
**"Underline"** (in a row), popups **"Bold (Ctrl+B)"**, **"Italic (Ctrl+I)"**, **"Underline
(Ctrl+U)"**; and, apart from them, a button **"Elsewhere"**.

Checks:

1. Hovering "Bold" opens its tooltip only after at least 700 ms.
2. Moving the pointer to "Italic" shows "Italic (Ctrl+I)" in under 400 ms and hides "Bold
   (Ctrl+B)": only one `tooltip` is visible.
3. Moving to "Elsewhere", waiting 1 s (past `timeout`), then hovering "Underline": no tooltip for
   the first 400 ms; it opens after the delay.

### `/tooltip/in-dialog`

A [Dialog](dialog.md) Trigger **"Open dialog"**; its popup has Title **"Formatting"**, a Tooltip
whose Trigger is a button **"Bold"** and whose popup says **"Bold (Ctrl+B)"**, and a Close
**"Close"**.

Checks (the tooltip is not a layer, and its Escape stops there):

1. Open the dialog, Tab to "Close", Shift+Tab back to "Bold": the tooltip "Bold (Ctrl+B)" opens.
2. Escape closes the tooltip only: the dialog stays open, focus on "Bold".
3. Escape again closes the dialog.

## Differences from Base UI

Measured by the POC against Base UI 1.9 (`Tooltip`). One difference, kept by the behaviour rule
(D4 §3 "Tooltip"):

| difference | decision |
| --- | --- |
| Base UI's Popup has no role and its Trigger gets no `aria-describedby`, so the tooltip does not describe the trigger unless the consumer wires it | **keep** the wiring in the primitive: the APG tooltip pattern |

The hover intent, the hoverable popup (WCAG 1.4.13), focus, Escape, the press, touch and the
delay group match.
