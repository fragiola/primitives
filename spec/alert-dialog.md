# AlertDialog

## Purpose

A **modal alert dialog**: a dialog that interrupts the user with a message that needs a response,
usually a confirmation of a destructive action (APG `alertdialog`). It takes focus, traps it, makes
the rest of the page inert and returns focus when it closes, as [Dialog](dialog.md) does, but it is
never dismissed by a press outside it: the user answers it (one of its buttons) or presses Escape.
A dialog that may be dismissed from outside is a [Dialog](dialog.md).

AlertDialog has its own entry (`/alert-dialog`) and is **built on Dialog's parts**: the same
Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description and Close, whose part
attribute names the component they belong to (`alert-dialog-popup`, read from the Root, as the
calendar family's shared parts are). Everything this page does not change is
[dialog.md](dialog.md)'s: the nested overlay tree, nested dialogs, detached triggers, the open
change details, the lifecycle and `keepMounted` ([README](README.md#overlays)). Its entry is built
on Dialog's (`ENTRY_DEPENDENCIES`); Dialog's entry holds none of AlertDialog's code.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | none (renders no element) | | holds the state |
| Trigger | `button` | `alert-dialog-trigger` | opens the alert dialog |
| Portal | none | | moves Backdrop, Viewport and Popup to the end of `body` |
| Backdrop | `div` | `alert-dialog-backdrop` | covers the page; optional; a nested one renders nothing unless `forceRender` |
| Viewport | `div` | `alert-dialog-viewport` | optional; wraps the Popup (as Dialog's) |
| Popup | `div` | `alert-dialog-popup` | the `alertdialog` |
| Title | `h2` | `alert-dialog-title` | names it |
| Description | `p` | `alert-dialog-description` | describes it: the message |
| Close | `button` | `alert-dialog-close` | closes it; the least destructive answer ("Cancel") |

## API

As [Dialog's](dialog.md#api), part by part, with these differences:

- **Root**: no `modal` prop (always modal) and no outside dismissal option: a press outside never
  closes it. `handle` takes an AlertDialog handle.
- **createHandle**: `createAlertDialogHandle<Payload>()` (React and Vue also
  `AlertDialog.createHandle`), with Dialog's methods (`open(triggerId)`, `openWithPayload`,
  `close()`, `isOpen`).
- **Popup**: `initialFocus` (default: the **first Close part** inside the popup, else the first
  tabbable element, else the popup itself; `false` focuses the popup), `finalFocus` (as Dialog's).

The other actions of an alert dialog (the destructive "Discard", "Delete") are the app's own
buttons: they act and then close the dialog through the controlled `open`, the handle's `close()`
or the actions' `close()` (reason `imperative-action`).

## State attributes and ARIA

As [Dialog's](dialog.md#state-attributes-and-aria), with:

| part | attributes |
| --- | --- |
| Trigger | `aria-haspopup="dialog"` (ARIA has no `alertdialog` value), `aria-expanded`, `aria-controls`, `data-popup-open` on the active trigger, `data-disabled`, an `id` |
| Popup | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` (the Title's id), `aria-describedby` (the Description's id), `tabindex="-1"`, `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `data-nested`, `data-nested-dialog-open`; the inline style `--nested-dialogs: <n>`; `hidden` while kept mounted and closed |
| Backdrop, Viewport | as Dialog's (`alert-dialog-*` part attributes) |

The APG asks an alert dialog for an accessible name and a description: the consumer renders a
Title and a Description.

## Keyboard

| key | action |
| --- | --- |
| Enter, Space on Trigger | opens |
| Tab, Shift+Tab | cycle inside the popup (the focus trap, as Dialog's) |
| Escape | closes (reason `escape-key`; the APG alert dialog closes on Escape), unless a child layer is open: then only that layer closes |

## Focus

- On open, focus moves to `initialFocus`, else the **first Close part** of the popup (APG
  `alertdialog`: focus goes to the least destructive action, which an app renders as its Close,
  e.g. "Cancel"), else the first tabbable element, else the popup. A Close of a dialog nested in
  the popup does not count (it is in its own portal).
- Focus is trapped inside the popup and its child layers; the outside is inert.
- On close, focus moves as Dialog's: `finalFocus`, else the active trigger, else the element
  focused before it opened. A close with `imperative-action` returns focus as `none` does.
- A press outside the popup (on the backdrop, on the viewport around the popup, or on the inert
  page) does not move focus: the element that had it keeps it (the press's default focus change
  is prevented, so focus is never left on the body).

## Pointer

- A press on the Trigger opens; a press on Close closes (reason `close-press`).
- **A press outside the popup does nothing**: it does not close the alert dialog, does not call
  `onOpenChange`, and does not move focus. A press inside a child layer of the popup (a Popover
  opened from it) is that layer's.

## Dismissal and layering

The alert dialog is a layer of the nested overlay tree ([README](README.md#the-nested-overlay-tree)),
as a Dialog: Escape closes the newest layer only; a press outside the alert dialog closes the
layers opened from it that the press is outside of (the tree's rule for its descendants), never
the alert dialog itself; closing it closes the overlays opened from it (reason `none`). It is a
**modal** layer, as a Dialog ([dialog.md](dialog.md#dismissal-and-layering)): a press outside it
and its descendants counts as a press inside the layer it was opened from, so an alert dialog
opened from a Popover or a Menu that stays open keeps both open (the press would otherwise close
the Popover, whose close would close the alert dialog with `none`). The page does not scroll
while it is open (scroll lock).

An AlertDialog inside a Dialog's popup (or a Dialog inside an AlertDialog's popup) is a **nested
dialog** ([dialog.md](dialog.md#nested-dialogs)): the same `data-nested`,
`data-nested-dialog-open` and `--nested-dialogs`, shared by both components.

## Detached triggers

As [Dialog's](dialog.md#detached-triggers), with an AlertDialog handle.

## Positioning

None: the popup is placed by the consumer's styles.

## Animation

As [Dialog's](dialog.md#animation).

## RTL

Nothing changes in behaviour.

## Scenarios

### `/alert-dialog/basic`

Content:

- a button **"Discard draft"** (Trigger);
- a button **"Outside button"** in the page;
- a Backdrop and a Popup with Title **"Discard draft?"**, Description **"Your unsaved changes will
  be lost."**, then, in this DOM order, a button **"Discard"** (the app's own button: it prints
  `action: discard` and closes the alert dialog through the actions' `close()`) and a Close
  **"Cancel"**.

Output: `open: <true|false>`, `reason: <last reason>`, `action: <discard|none>`.

Checks:

1. The Trigger has `aria-haspopup="dialog"` and `aria-expanded="false"`.
2. Click "Discard draft": an `alertdialog` named "Discard draft?" and described by "Your unsaved
   changes will be lost.", with `aria-modal="true"`; output `open: true`, `reason: trigger-press`.
3. Focus is on "Cancel" (the first Close), not on "Discard" (the first tabbable element).
4. Tab moves to "Discard", then wraps to "Cancel"; "Outside button" is inert.
5. A press on the backdrop (the page's corner) does nothing: the alert dialog stays open, the
   output still reads `reason: trigger-press`, focus is still on "Cancel".
6. Escape closes it: `open: false`, `reason: escape-key`, focus on "Discard draft".
7. Reopen, click "Cancel": `reason: close-press`, focus on "Discard draft".
8. Reopen, click "Discard": `action: discard`, `open: false`, `reason: imperative-action`, focus
   on "Discard draft".
9. Axe finds no violation while open.

### `/alert-dialog/detached`

Two Triggers in a row (`<div class="flex gap-2">`): **"Delete Ada"** (`id="delete-ada"`,
`payload` `"Ada"`) and **"Delete Grace"** (`delete-grace`, `"Grace"`), with the `handle` of a Root
that sits after them, then a button **"Delete for Grace"** that calls the handle's
`open("delete-grace")`. The Root's content is a function of the payload: a Portal with a Backdrop,
a Viewport and a Popup whose Title is **"Delete <name>?"** (one text node), Description
**"This cannot be undone."** and a Close **"Cancel"**. Output: `open: ...`, `reason: ...`,
`trigger: <the details' trigger's id, or none>`.

Checks:

1. Click "Delete Grace": an `alertdialog` named "Delete Grace?"; `trigger: delete-grace`; "Delete
   Grace" has `aria-expanded="true"`, "Delete Ada" `aria-expanded="false"`; focus on "Cancel".
2. Escape: focus returns to "Delete Grace"; click "Delete Ada": an `alertdialog` named "Delete
   Ada?"; "Cancel" returns focus to "Delete Ada".
3. Click "Delete for Grace": an `alertdialog` named "Delete Grace?", `reason: imperative-action`,
   `trigger: delete-grace`.
4. A press on the viewport outside the popup does nothing (the dialog stays open, the output's
   `reason` unchanged).
5. Contract layer: only the active Trigger has `data-popup-open`; the Viewport has
   `role="presentation"` and `data-open`.
6. Axe finds no violation while open.

### `/alert-dialog/lifecycle`

The lifecycle scenario ([README](README.md#the-lifecycle-scenarios)): a Trigger **"Delete
file"**; a Portal with `keepMounted` holding a Backdrop and a Popup with Title **"Lifecycle"**, a
Description **"Delete the file?"**, a button **"Close with actions"** and a Close **"Close"**.
The kept-mounted part is the Popup.

Checks: the common checks, where the outside press is replaced by its absence: with `?cancel`, a
press outside reports nothing (`canceled` keeps its last value) and the alert dialog stays open;
"Close with actions" closes it with `reason: imperative-action` and focus on "Delete file".

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's AlertDialog focuses the first tabbable element on open | **the first Close part** (else the first tabbable): the APG alert dialog puts focus on the least destructive action, which an app renders as its Close |
| Base UI's popup sets no `aria-modal="true"` | keep `aria-modal="true"`, as Dialog's (the APG) |
| A press outside lets the browser move focus (to the body when nothing focusable was pressed) | the press's default focus change is prevented: focus stays where it was, inside the alert dialog |

Its own entry, the part attributes named `alert-dialog-*`, the Viewport, the nested attributes,
the handle and the lifecycle follow Base UI.
