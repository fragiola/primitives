# Toast

## Purpose

Brief notifications that appear in a stack, announce themselves to assistive technology and close
on their own after a timeout (Base UI's Toast). The APG has no toast pattern, so the
announcement follows WAI-ARIA live regions (`aria-live`, `aria-relevant`, `aria-atomic`) and the
keyboard follows Base UI: an F6 landmark, Escape on a toast. The toasts live in a **toast queue**
outside every framework (`@fragiola/primitives/toast`, `createToastManager`): a plain module can
import it and add toasts with no component, and the Provider renders from it. Placement presets,
icons and the stack's look belong to the app (Fragiola UI); anchored toasts (Base UI's Positioner
and Arrow) are out of scope.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Provider | none | | gives its parts the toast queue (its own, or `toastManager`) |
| Portal | none | | renders the Viewport into `body` |
| Viewport | `div` | `toast-viewport` | the `region` landmark that holds the toasts, reached with F6 |
| (announcer) | `div` | `toast-announcer` | two live regions the Viewport puts first inside itself, polite and assertive (`data-priority` `low` / `high`); visually hidden |
| (announcement) | `div` | `toast-announcement` | one per shown toast inside its priority's announcer: its title and description |
| Root | `div` | `toast-root` | one toast; the consumer renders one per toast of the queue |
| Title | `h2` | `toast-title` | the toast's name; its children default to the toast's `title` |
| Description | `p` | `toast-description` | its description; its children default to the toast's `description` |
| Action | `button` | `toast-action` | an action the app wires (`onClick`) |
| Close | `button` | `toast-close` | closes the toast |

## API

**The toast queue** (`@fragiola/primitives/toast`; each framework's `/toast` entry also exports
`createToastManager`): `createToastManager<Data>({ limit, timeout })` returns a manager:

| member | what |
| --- | --- |
| `add(options)` | adds a toast, newest first, and returns its id; with the `id` of an open toast, updates it in place and restarts its timer |
| `update(id, updates)` | changes an open toast (an object, or a function of the toast); ignored once it is closing |
| `close(id?)` | closes a toast, or every toast without an id |
| `promise(promise, { loading, success, error })` | a `loading` toast (it never closes by itself) that becomes `success` or `error` when the promise settles; each state is a title, options, or a function of the result or the error; returns the promise's own result |
| `toasts()` | the toasts, newest first (the same array until a change) |
| `subscribe(listener)` | called after every change; returns the unsubscribe |
| `remove(id)`, `setHeight(id, height)`, `pause(source)`, `resume(source)`, `configure({ limit, timeout })` | what the parts report back (the end of an exit, a measured height, a pause); an app rarely calls them |

Toast options: `id`, `title`, `description` (strings), `type` (free-form, `data-type`; `loading`
never closes by itself), `timeout` (ms, default the queue's, `0` never), `priority` (`low`
default, `high`), `data` (the app's), `onClose()` (once it closes, whatever closed it), `onRemove()`
(once it left the list, after its exit). A toast of the queue also carries `closing`, `limited`,
`index`, `height`, `offsetY` and `updateKey` (below).

**Provider**: `toastManager` (a queue the app created, for instance in a plain module; default: a
queue of its own), `limit` (`3`), `timeout` (`5000`). Given a `toastManager`, the Provider passes
it only the `limit` and `timeout` it was given, so a queue keeps its own options otherwise.

**The queue in a component**: React `Toast.useToastManager()` (also `useToastManager` from the
entry), Vue `useToastManager()`, Angular `injectToastManager()`: the Provider's queue, with its
`toasts` as the framework's reactive value (React an array, Vue a `Ref`, Angular a `Signal`) and
`add`, `update`, `close`, `promise`.

**Portal**: `container` (default: `body`).

**Viewport**: no prop of its own. The app names it (`aria-label`, for instance
"Notifications"): no text of the primitive's.

**Root**: `toast` (required: one toast of the queue), `swipeDirection` (`right` default; `up`,
`down`, `left`, `right`: the edge a swipe dismisses it towards).

**Title**, **Description**, **Action**, **Close**: no prop of their own.

## The toast queue

- **Order**: newest first. The newest `limit` toasts that are not closing show; the older ones
  are **queued** (`limited`): they stay rendered with `data-limited` and `inert`, and show again
  as the newer ones close.
- **Timers**: each toast closes `timeout` ms after it shows. A queued toast's timer waits until it
  shows; a `loading` toast and `timeout: 0` have none; `update` restarts the timer when it changes
  `timeout` or `type` (a promise toast's success or error starts it); an upsert restarts it.
- **Pausing**: every timer pauses while the pointer is over the Viewport, while the keyboard is in
  it (a focus-visible focus, F6 included), and while the page is hidden (`visibilitychange`); each
  keeps what it had left. A touch swipe pauses them while it runs.
- **Closing**: a closed toast keeps rendering with `data-ending-style` until its exit animation
  ends, then leaves the queue (`remove`, `onRemove`). `onClose` runs once, at the close.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Viewport | `role="region"`, `tabindex="-1"`, `data-expanded` while the pointer is over it or the keyboard is in it; `--toast-frontmost-height` (the frontmost toast's height, px) |
| announcer | `aria-live="polite"` (`data-priority="low"`) or `aria-live="assertive"` (`data-priority="high"`), `aria-atomic="false"`, `aria-relevant="additions text"`, a visually hidden inline style |
| Root | `role="dialog"` (`alertdialog` for a `high` priority), `aria-modal="false"`, `aria-labelledby` (its Title), `aria-describedby` (its Description), `tabindex="0"`, `data-type`, `data-expanded`, `data-limited` and `inert` while queued, `data-swiping`, `data-swipe-direction` (where a swipe moves it, while it moves and after a swipe dismissed it), `data-starting-style`, `data-ending-style`; `--toast-index` (`0` the frontmost shown toast), `--toast-offset-y` (the heights in front of it, px), `--toast-height` (px, once measured), `--toast-swipe-movement-x` / `-y` (px) |
| Title, Description | an `id` (the Root's labels) |
| Action, Close | `type="button"`, `data-type` |

**Announcements** (WAI-ARIA live regions; the APG has no toast pattern): the Viewport puts two
live regions first inside itself, which exist before any toast. When a toast shows, an
announcement holding its title and description (one text, a space between) is appended to the
region of its priority, after the earlier ones, so a screen reader reads each new toast once, in
the order they showed: politely for `low`, assertively for `high`. An update changes the
announcement's text in place (a promise toast's result is announced); a close removes it, and so
does being queued. The toasts themselves are not a live region, so nothing is announced twice.

## Keyboard

| key | action |
| --- | --- |
| F6 (anywhere, while a toast shows) | focuses the Viewport; it remembers where focus was |
| F6 in the Viewport, Shift+Tab on the Viewport itself | focus goes back where it was |
| Tab, Shift+Tab inside | through the toasts (each Root is a tab stop) and their buttons |
| Escape with focus in a toast | closes that toast |
| Enter, Space on Close | closes the toast |

## Focus

Opening a toast never moves focus. When a toast closes with the keyboard in it (a focus-visible
focus: its Close, Escape), focus moves to the next shown toast, else the previous one, else back
where it was before F6 (or off the Viewport).

## Pointer

- The pointer over the Viewport pauses every timer and expands the stack (`data-expanded`). After
  it leaves, the stack stays expanded until no exit runs, so a toast does not slide under the
  pointer.
- **Swipe** (`@fragiola/primitives/swipe`, Drawer's mechanism): a mouse, pen or touch drag on a
  Root, along its `swipeDirection`'s axis, moves it (`data-swiping`,
  `--toast-swipe-movement-x` / `-y`, `data-swipe-direction`). Released past half the toast's size
  in that direction, or at least 10 px at 0.5 px/ms (a flick), it closes; otherwise it settles
  back. The mouse never swipes from a button or a link (the toolkit's rule); `data-swipe-ignore`
  marks more.

## Stacking

Each Root is measured (`measureToastHeight`: its height with `height: auto`) when it mounts and on
each update. `--toast-index`, `--toast-offset-y` and `--toast-height` let a stylesheet stack the
toasts collapsed (the older ones peeking behind the frontmost, `--toast-frontmost-height`) and
expanded (`data-expanded`: each one at its offset). A closing toast's height leaves the stack.

## Animation

A Root has `data-starting-style` for its first frame and `data-ending-style` while its exit
animation runs, as every presence; then it leaves the queue.

## RTL

Nothing changes: `swipeDirection` is physical.

## Server rendering

The Viewport is portaled: nothing of it renders on a server (README "Server rendering"); a
scenario's page renders on the server without it.

## Scenarios

The conformance tests drive the timers with Playwright's clock (installed before the page loads,
then fast-forwarded).

### `/toast/basic`

A queue created in a plain module of the fixture (`timeout` `3000`), given to the Provider. A
button **"Before"**, a button **"Show toast"** (calls the module's `add` directly:
title **"Saved"**, description **"Your draft was saved."**), a button **"Show alert"** (the
framework's `useToastManager` / `injectToastManager` `add`: title **"Connection lost"**,
description **"Retrying in 5 seconds."**, `priority: "high"`), a button **"Close all"**
(`close()`). The Portal and the Viewport (`aria-label` **"Notifications"**) render one Root per
toast with its Title, Description, an Action **"Undo"** (prints `action: <title>` and closes the
toast) and a Close **"Dismiss"**. Every toast prints `closed: <title>` from its `onClose`. Output:
`toasts: <count of toasts not closing>`, `closed: ...`, `action: ...`.

Checks:

1. The region "Notifications" is in the page with its two empty live regions (polite, then
   assertive) before any toast.
2. "Show toast": a `dialog` "Saved" with the description "Your draft was saved." shows in the
   region; the polite live region holds "Saved Your draft was saved."; `toasts: 1`.
3. It closes by itself after 3 s (not at 2.9 s); `closed: Saved`, `toasts: 0`; it leaves the page.
4. The pointer over it pauses it: 10 s later it is still there; once the pointer left, it closes
   3 s later.
5. "Dismiss" closes it; "Undo" prints `action: Saved` and closes it.
6. "Show alert": an `alertdialog` "Connection lost"; the assertive live region holds its text, the
   polite one nothing new.
7. F6 from "Before" focuses the region (and pauses it); Tab focuses the toast; Escape closes it
   and focus returns to "Before". With two toasts, Escape on the first focuses the second. F6 in
   the region goes back to "Before".
8. A hidden page pauses it (no close 10 s later); visible again, it closes 3 s later.
9. Two toasts announce in the order they showed; "Close all" closes both. Axe finds no violation
   with both shown.

### `/toast/limit`

A Provider (`limit` `2`, `timeout` `0`) and a button **"Notify"** that adds **"Notification
<n>"** (`n` from 1, one text node) with the description **"Message <n>"**. The Viewport
(**"Notifications"**) renders each toast with its Title, Description and a Close **"Dismiss"**.

Checks:

1. Three "Notify": Notification 3 and 2 show (`--toast-index` `0` and `1`); Notification 1 is
   queued (`data-limited`, `inert`, no `dialog` in the accessibility tree, no announcement).
2. Its `--toast-offset-y` is the heights in front of it; `--toast-height` is set on each.
3. Dismissing Notification 3 shows Notification 1 again (`--toast-index` `1`) and announces it.
4. The pointer over the region sets `data-expanded` on the Viewport and every Root; it goes once
   the pointer left.

### `/toast/promise`

A Provider (`timeout` `2000`), buttons **"Save file"** and **"Save offline"**: each calls
`promise` with a promise that resolves (rejects for "Save offline") 1 s later, and `loading`
**"Saving file"**, `success` **"File saved"**, `error` a function giving **"Could not save:
offline"** (from the error's message `offline`). The Viewport (**"Notifications"**) renders each
toast with its Title and a Close **"Dismiss"**.

Checks:

1. "Save file": a toast "Saving file" (`data-type="loading"`), which stays past its timeout while
   the promise runs; after 1 s it says "File saved" (`data-type="success"`), and its announcement
   says so too; it closes 2 s later.
2. "Save offline": after 1 s it says "Could not save: offline" (`data-type="error"`).

### `/toast/swipe`

A Provider (`timeout` `0`) and a button **"Notify"** (title **"Swipe me"**, description **"Drag
to dismiss"**); each Root with `swipeDirection` `right` and a Close **"Dismiss"**. Output:
`toasts: <count of toasts not closing>`.

Checks:

1. A mouse drag on the toast's text, 20 px to the right: `data-swiping`,
   `data-swipe-direction="right"`, `--toast-swipe-movement-x` near 20 px; released, it settles back
   (`toasts: 1`).
2. A drag of more than half its width to the right closes it (`toasts: 0`).
3. A touch swipe to the right closes it too; a drag to the left does not.

## Differences from Base UI

Measured against Base UI 1.9 (`references/base-ui`, `Toast`).

| difference | decision |
| --- | --- |
| Base UI's manager (`createToastManager`) only sends events to the Provider, which holds the toasts | **the manager is the queue**: it holds the toasts and their timers, so a plain module can read them too (the catalog's "toast queue outside the framework") |
| Base UI makes the Viewport the polite live region and copies a `high` toast into a visually hidden `role="alert"` while hiding the toast itself (`aria-hidden`, which axe reports on a focusable toast) | **two live regions** inside the Viewport hold every shown toast's text; the toasts are not live, so nothing is announced twice and no focusable element is hidden |
| Base UI names the Viewport "Notifications" | **no text**: the app names it (README "No text") |
| Base UI's Close is `aria-hidden` while the stack is collapsed and the Close unfocused | not hidden (axe: a focusable element must not be `aria-hidden`) |
| Base UI's queued (`limited`) toasts keep running their timers | **a queued toast's timer waits until it shows**, so it is seen for its full timeout |
| Base UI swipes towards `down` or `right` (several directions, a 40 px threshold) | **one direction** (`right` default) through the toolkit's `/swipe`, Drawer's thresholds (half the size, or a flick) |
| Base UI pauses on a window blur | pauses on a **hidden page** (the Issue's rule); the hover, focus and touch pauses match |
| Base UI's Viewport has focus guards around it | none: F6 and Shift+Tab return focus |
| Base UI's `Positioner`, `Arrow` and `Content`, anchored toasts, `actionProps` | out of scope; Action is a button the app wires |
| Base UI's Title and Description take any node | the queue's `title` and `description` are strings (one queue for every framework); a Title and Description still render any children |
