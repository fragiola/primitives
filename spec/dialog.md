# Dialog

## Purpose

A **modal** dialog: a window over the page that takes focus, traps it, makes the rest of the page
inert and returns focus when it closes (APG `dialog-modal`). Non-modal floating content is
[Popover](popover.md). Alert dialogs are AlertDialog's (Issue #34). A dialog may open from several
triggers anywhere in the page (detached triggers, with a payload), may hold other overlays and
other dialogs (nested dialogs), and shares the overlay mechanisms of
[spec/README.md](README.md#overlays): the nested overlay tree, the open change details, the
lifecycle controls and `keepMounted`.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none (renders no element) | | holds the state |
| Trigger | `button` | `dialog-trigger` | opens the dialog |
| Portal | none | | moves Backdrop, Viewport and Popup to the end of `body` (or a given container) |
| Backdrop | `div` | `dialog-backdrop` | covers the page; optional; a nested dialog's renders nothing unless `forceRender` |
| Viewport | `div` | `dialog-viewport` | optional; inside the Portal, wraps the Popup: a full-page container a recipe positions the popup in (Base UI) |
| Popup | `div` | `dialog-popup` | the dialog itself |
| Title | `h2` | `dialog-title` | names the dialog |
| Description | `p` | `dialog-description` | describes the dialog |
| Close | `button` | `dialog-close` | closes the dialog |

## API

**Root**: `open`, `defaultOpen` (`false`), `onOpenChange(open, details)` (an
`OpenChangeDetails`, [README](README.md#open-change-details)), `onOpenChangeComplete(open)`, the
actions (`close()`, `unmount()`; React `actionsRef`), `handle`, `triggerId` / `defaultTriggerId`
(the active trigger, [README](README.md#detached-triggers)); its content may be a function of the
active trigger's `payload` (the API mapping of spec/README.md).

**Trigger**: `disabled`, `handle` (a Trigger outside the Root), `payload` (any value; the
content receives the active trigger's), `id` (generated when not given).

**createHandle**: `createDialogHandle<Payload>()` (React and Vue also `Dialog.createHandle`): a
handle with `open(triggerId: string | null)`, `openWithPayload(payload)`, `close()` and `isOpen`.

**Portal**: `container` (an element; defaults to `body`), `keepMounted` (`false`: the content
stays rendered while closed, [README](README.md#lifecycle)).

**Backdrop**: `forceRender` (`false`): a nested dialog's Backdrop renders only with it (Base UI:
the parent's backdrop already covers the page).

**Viewport**: nothing beyond the contract.

**Popup**: `initialFocus` (element to focus on open; default: the first tabbable element inside,
else the popup itself), `finalFocus` (element to focus on close; default: the trigger, or the
element that had focus before opening when it was opened programmatically).

**Title**, **Description**, **Close**: no props of their own beyond the contract.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Trigger | `aria-haspopup="dialog"`, `aria-expanded` (`"true"` on the active trigger while open, `"false"` on the others), `aria-controls` (the popup's id, on the active trigger while open), `data-popup-open` on the active trigger while open (Base UI's name for a trigger, D4 §3 "Naming"; the POC wrote `data-open`), `data-disabled`, an `id` |
| Backdrop | `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-nested`, `data-nested-dialog-open`; `aria-hidden="true"`; `hidden` while kept mounted and closed |
| Viewport | `role="presentation"`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-nested`, `data-nested-dialog-open`; `hidden` while kept mounted and closed |
| Popup | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (the Title's id when a Title exists), `aria-describedby` (the Description's id when one exists), `tabindex="-1"`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-nested`, `data-nested-dialog-open`; the structural inline style `--nested-dialogs: <n>`; `hidden` while kept mounted and closed |
| Title, Description | an `id` (generated unless given) |
| Close | none beyond the part attribute |

`data-open` and `data-closed`: exactly one is present on a rendered Backdrop, Viewport and Popup
(`data-closed` while the exit runs, or while kept mounted).

## Keyboard

| key | action |
| --- | --- |
| Enter, Space on Trigger | opens (native button activation) |
| Tab | moves to the next tabbable element inside the popup; from the last, wraps to the first |
| Shift+Tab | the reverse; from the first, wraps to the last |
| Escape | closes (reason `escape-key`), unless a child layer is open: then only that layer closes |

## Focus

- On open, focus moves to `initialFocus`, else the first tabbable element of the popup, else the
  popup itself.
- Focus is trapped inside the popup (and its child layers) while open.
- On close, focus moves to `finalFocus`, else the active trigger (the one that opened it), else
  the element that had focus before it opened. A close with the reason `imperative-action` (a
  handle, the actions) returns focus as `none` does. After an outside press (on the backdrop or
  the viewport, which blurs the page), focus returns once the press has ended, unless the press
  focused an element (`returnFocus.whenUnfocused`, as Popover's).
- Everything outside the portal content is made inert (`inert`, or `aria-hidden` plus focus
  guards where `inert` is unavailable) while open.

## Pointer

- A press on the Trigger opens. A press on Close closes (reason `close-press`).
- A press outside the popup (on the backdrop, on the viewport around the popup, or anywhere
  else) closes (reason `outside-press`), except on an element inside a child layer.

## Dismissal and layering

- The dialog is a **layer** of the nested overlay tree ([README](README.md#the-nested-overlay-tree)).
  Escape closes the newest open layer only.
- A layer opened from inside the popup (a Popover, a Menu, another Dialog) is its child, and the
  overlays opened from that child its grandchildren, whatever the DOM position of their portals:
  a press inside a descendant is not an outside press for the dialog, Escape closes the deepest
  first, and the focus trap accepts focus in every descendant. A press inside the dialog closes
  its descendants only ([`/dialog/nested-tree`](#dialognested-tree)).
- Closing the dialog closes the overlays opened from it (reason `none`).
- While open, the page does not scroll (scroll lock on the document element, keeping the
  scrollbar gutter so the layout does not shift).

## Nested dialogs

A Dialog whose Root sits inside another dialog's Popup is **nested** in it (Base UI):

- its Popup, Backdrop and Viewport carry `data-nested`;
- the parent's Popup, Backdrop and Viewport carry `data-nested-dialog-open` while a nested dialog
  is open, and the parent Popup's inline style sets `--nested-dialogs: <n>`, the number of open
  dialogs nested below it as a chain (a child open with its own child open gives `2`; `0` when
  none), so a recipe can scale or offset the parent;
- its Backdrop renders nothing unless `forceRender`: the outermost backdrop already covers the
  page;
- a press on its Viewport (or Backdrop) outside its Popup closes it only: the press is inside the
  parent dialog (the tree's rule);
- Escape closes one level at a time, focus returning to each level's trigger.

## Detached triggers

A Dialog opens from any number of Triggers ([README](README.md#detached-triggers)): one inside the
Root, or anywhere in the page with the same `handle`; each with a `payload` the content reads (a
table row's data). Only the active trigger reports the open state; focus returns to it. The
handle's `open(triggerId)` opens it from a Trigger's id (that Trigger becomes the active one),
`openWithPayload(payload)` with a payload and no trigger, `close()` closes it, all with the reason
`imperative-action`. The other Triggers are inert while the modal dialog is open, so a dialog does
not move between triggers while open.

## Positioning

None: the popup is centred by the consumer's styles. The primitive sets no position.

## Animation

Backdrop, Viewport and Popup carry `data-starting-style` for the first frame after mounting, and
`data-ending-style` while closing. They unmount when every animation on the popup has finished
(`element.getAnimations()`), or at once when there is none; with the Portal's `keepMounted` they
are hidden instead (`hidden`, `data-closed`). Focus returns on close immediately, not after the
exit animation. `onOpenChangeComplete` reports the end of each transition, a close's
`details.preventUnmountOnClose()` holds the exit until the actions' `unmount()`
([README](README.md#lifecycle)).

## RTL

Nothing changes in behaviour.

## Scenarios

### `/dialog/basic`

Content:

- a button **"Open dialog"** (Trigger);
- a button **"Outside button"** in the page, outside the dialog;
- the popup with Title **"Edit profile"**, Description **"Change your display name."**, a text
  input labelled **"Name"**, a button **"Save"** (closes the dialog through a Close part) and a
  button **"Close"** (Close);
- a Backdrop;
- the page is taller than the viewport (so scroll lock is observable).

Output: `open: <true|false>` and `reason: <last reason>`.

Checks:

1. Trigger has `aria-haspopup="dialog"` and `aria-expanded="false"`; after opening, `"true"` and
   `aria-controls` pointing at the dialog.
2. Clicking "Open dialog" shows a `dialog` named "Edit profile" and described by "Change your
   display name.", with `aria-modal="true"`.
3. Focus is on the "Name" input.
4. Tab moves to "Save", then "Close", then wraps to "Name"; Shift+Tab from "Name" goes to "Close".
5. "Outside button" is not reachable by Tab and is inert.
6. Mouse wheel over the page does not scroll it while open.
7. Escape closes; output `reason: escape-key`; focus is back on "Open dialog".
8. Reopen, click the backdrop area: closes with `reason: outside-press`.
9. Reopen, click "Close": closes with `reason: close-press`; focus on the trigger.
10. Axe finds no violation with the dialog open.

### `/dialog/initial-focus`

A Trigger **"Delete file"**; the popup has Title **"Delete file?"**, then a button **"Delete"**,
then a button **"Cancel"** (Close), in this DOM order, with `initialFocus` set to "Cancel".

Checks: on open, focus is on "Cancel", not on "Delete" (the first tabbable element).

### `/dialog/nested-popover`

The popup of `/dialog/basic` without its input (Title **"Edit profile"**, Description **"Change
your display name."**, a Close **"Close"**), plus a [Popover](popover.md) inside it: a Trigger
**"More info"** whose popup has Title **"About names"** and a Close **"Got it"**. The popover is a
child layer of the dialog (`@fragiola/primitives/layers`).

Checks (after opening the dialog, then the popover):

1. Focus moves into the popover ("Got it", its first tabbable element).
2. Escape closes the popover only, with focus back on "More info"; the dialog stays open. Escape
   again closes the dialog.
3. A press inside the dialog, outside the popover (on its title), closes only the popover; focus
   goes to the dialog's popup, the focusable element (`tabindex="-1"`) the press landed in, so it
   stays inside the dialog ([popover.md](popover.md#focus), "After an outside press").

### `/dialog/controlled`

The fixture holds `open` in its own state; a button **"Open dialog"** outside the Dialog sets it
to `true` (there is no Trigger part), and the popup has Title **"Controlled"** and a Close
**"Close"**. Output: `open: ...`, `reason: ...`.

Checks: the external button opens the dialog; Close sets `open: false` with
`reason: close-press`; focus goes back to the external button (the element focused before
opening).

### `/dialog/rejected-close`

As `/dialog/controlled` (an external button **"Open dialog"**, no Trigger), with a Backdrop, a
Title **"Locked"** and a Close **"Close"**, but the fixture keeps `open: true` once opened: it
records each change's reason and ignores a change to `false`. Output: `open: ...`, `reason: ...`.

Checks (spec/README.md, "A controlled value the consumer rejects"): open it, focus is on "Close";
Escape reports `reason: escape-key` and the dialog stays open with focus on "Close"; a click
outside reports `reason: outside-press` and the dialog stays open; "Close" reports
`reason: close-press`, `open: true` and the dialog stays open; Escape still works afterwards (no
broken layer) and the outside stays inert.

### `/dialog/nested-tree`

Four levels of three kinds ([README](README.md#the-nested-overlay-tree)): a Dialog, a
[Popover](popover.md) opened from its popup, a [Menu](menu.md) opened from the popover, and a
submenu of that menu.

Content:

- a Trigger **"Open settings"**; a Backdrop; the popup with Title **"Settings"**, then a Popover
  whose Trigger is **"Theme options"**, then a Close **"Close"**;
- the popover's popup (Positioner `sideOffset` 4) has Title **"Theme"** and a Menu whose Trigger
  is **"Pick theme"**;
- the menu has the items **"Light"**, **"Dark"** and a SubmenuTrigger **"More themes"**, whose
  submenu has the items **"Solarized"** and **"Nord"**.

Every Root is uncontrolled. Output: `dialog: <open>`, `popover: <open>`, `menu: <open>`,
`submenu: <open>` (each Root's last `onOpenChange` value, `false` at first).

"Every level open" below means: click "Open settings", click "Theme options" (focus moves to "Pick
theme", the popover's first tabbable element), press ArrowDown (the menu opens with "Light"
focused), ArrowDown twice to "More themes", ArrowRight (the submenu opens with "Solarized"
focused). The output then reads `true` four times.

Checks:

1. With every level open: a `dialog` named "Settings", a `dialog` named "Theme", a `menu` named
   "Pick theme" and a `menu` named "More themes" are visible.
2. Escape closes one level at a time: the submenu (`submenu: false`, focus on "More themes"), the
   menu (`menu: false`, focus on "Pick theme"), the popover (`popover: false`, focus on "Theme
   options"), the dialog (`dialog: false`, focus on "Open settings").
3. With every level open, a press on the popover's title "Theme" (inside the popover, outside the
   menu) closes the menu and its submenu only: `menu: false`, `submenu: false`, `popover: true`,
   `dialog: true`.
4. With every level open, a press on the dialog's title "Settings" (outside the popover) closes the
   popover, the menu and the submenu: `dialog: true`, the other three `false`.
5. With every level open, a press on the backdrop (the page's corner) closes every level: the four
   are `false`.
6. Focus never leaves the dialog while it is open: at every step of checks 2–4 the focused element
   is inside the dialog's popup or one of the open descendants' popups; with the popover open, Tab
   from "Pick theme" (its last tabbable element) closes the popover (`popover: false`) and moves
   focus to "Close", inside the dialog.
7. Axe finds no violation with every level open.

### `/dialog/nested-dialogs`

Three dialogs nested in each other ([Nested dialogs](#nested-dialogs)), each with a Backdrop and a
Viewport around its Popup:

- a Trigger **"Open first"**; the first popup has Title **"First dialog"**, a Trigger **"Open
  second"** of the second Dialog, and a Close **"Close first"**;
- the second popup has Title **"Second dialog"**, a Trigger **"Open third"** of the third Dialog,
  and a Close **"Close second"**;
- the third popup has Title **"Third dialog"** and a Close **"Close third"**.

The nested Backdrops have no `forceRender`. Output: `first: <open>`, `second: <open>`,
`third: <open>`.

Checks:

1. Open the three (click "Open first", "Open second", "Open third"): three `dialog`s are named
   "First dialog", "Second dialog", "Third dialog"; one Backdrop is in the document (the nested
   ones rendered nothing).
2. Contract layer, with the three open: the first Popup and Viewport have
   `data-nested-dialog-open` and no `data-nested`, the Popup `--nested-dialogs: 2`; the second's
   have both `data-nested` and `data-nested-dialog-open`, `--nested-dialogs: 1`; the third's
   `data-nested` and no `data-nested-dialog-open`, `--nested-dialogs: 0`.
3. A press on the third Viewport outside its popup (the page's corner) closes only the third
   dialog: `third: false`, `second: true`, `first: true`, focus on "Open third"; the first Popup
   then has `--nested-dialogs: 1` and the second no `data-nested-dialog-open`.
4. Open the third again; Escape closes it (focus on "Open third"), Escape closes the second
   (focus on "Open second"), Escape closes the first (focus on "Open first").
5. Axe finds no violation with the three open.

### `/dialog/detached`

One Dialog opened from three table rows ([Detached triggers](#detached-triggers)). A list of three
rows, each with the name **"Ada"**, **"Grace"**, **"Alan"** as text and a Trigger **"Edit
Ada"** (`id="edit-ada"`, `payload` `"Ada"`), **"Edit Grace"** (`edit-grace`, `"Grace"`), **"Edit
Alan"** (`edit-alan`, `"Alan"`), each with the `handle` of a Root that sits after the list,
outside the rows. The Root's content is a function of the payload: a Portal with a Backdrop and a
Popup whose Title is **"Edit <name>"** (one text node), and a Close **"Close"**. After the list, a
button **"Open for Grace"** calls the handle's `open("edit-grace")`. Output: `open: ...`,
`reason: ...`, `trigger: <the details' trigger's id, or none>`.

Checks:

1. Every Trigger has `aria-haspopup="dialog"` and `aria-expanded="false"`.
2. Click "Edit Grace": a `dialog` named "Edit Grace"; output `open: true`, `reason:
   trigger-press`, `trigger: edit-grace`; "Edit Grace" has `aria-expanded="true"` and
   `aria-controls` the dialog's id, "Edit Ada" and "Edit Alan" `aria-expanded="false"` and no
   `aria-controls` (contract layer: only "Edit Grace" has `data-popup-open`).
3. Close returns focus to "Edit Grace"; click "Edit Alan": a `dialog` named "Edit Alan"; Escape
   closes it and focus returns to "Edit Alan".
4. Click "Open for Grace": a `dialog` named "Edit Grace", `reason: imperative-action`,
   `trigger: edit-grace`, "Edit Grace" has `aria-expanded="true"`; Escape returns focus to "Edit
   Grace".
5. Axe finds no violation while open.

### `/dialog/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a Trigger **"Open dialog"**;
a Portal with `keepMounted` holding a Backdrop and a Popup with Title **"Lifecycle"**, a button
**"Close with actions"** and a Close **"Close"**. The kept-mounted part the checks follow is the
Popup (and the Backdrop: both `hidden` while closed).

Checks: the common checks; besides, with `?cancel`, "Close" reports `canceled: close-press` and
the dialog stays open, its outside still inert; "Close with actions" returns focus to "Open
dialog" (the focus return of `none`).

## Differences from Base UI

The POC measured Base UI 1.9 against this spec (its `fixtures/baseline-react`). One difference,
decided by the behaviour rule (D4, APG first):

| difference | decision |
| --- | --- |
| Base UI's popup sets no `aria-modal="true"`: it relies on making the outside inert | keep `aria-modal="true"`, as the APG's modal dialog asks |

The Viewport, the nested-dialog attributes, the detached triggers, the open change details,
`onOpenChangeComplete`, the actions and `keepMounted` follow Base UI (Epic #35).
