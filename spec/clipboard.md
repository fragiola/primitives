# Clipboard

## Purpose

A button that copies a text to the system clipboard and shows, for a while, that it did: an
install command, an API key, a share link, a code block. An optional read-only Input shows the
text; an Indicator follows the copied state (an icon that turns into a check); a polite live
region says the app's "Copied" text to a screen reader.

It holds no form value (the text is the app's, not the user's): it is no Field control, and it
does not read the clipboard (no paste).

**Scope: stage 4** (Epic #94, Issue #92). The APG has no clipboard pattern and Base UI has no
Clipboard: the behaviour references are Zag/Ark's Clipboard and Angular CDK's clipboard (read,
never copied). Where they are silent, the APG-closest option is decided here (D4) and recorded in
`docs/decisions.md` ("Text inputs"):

- the **Trigger is a plain APG button** (no `aria-pressed`: a copy is an action, not a state);
- the **announcement** is a polite live region the Root renders, empty, with the page, into which
  the app's text is written when a copy succeeds (or fails): WAI-ARIA's live regions, as Toast's
  (Epic #61; written through the toolkit's `/clipboard`, not Toast's code), so a screen reader
  hears "Copied" without the focus moving;
- **writing uses the asynchronous Clipboard API only** (`navigator.clipboard.writeText`, the
  toolkit's `writeClipboard`); there is no `execCommand("copy")` fallback (a deprecated API).
  When the write fails (an insecure context, a denied permission, no user activation), the status
  becomes `failed` and, when an Input is rendered, the focus moves to it with its text selected,
  so the user copies it by hand (Ctrl+C). Angular CDK's hidden-textarea copy is not taken.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `clipboard-root` | holds the status; renders the announcer as its last child |
| Trigger | `button` | `clipboard-trigger` | copies the value; `type="button"` |
| Indicator | `span` | `clipboard-indicator` | follows the status (the app's icons); `aria-hidden="true"` |
| Input | `input` | `clipboard-input` | optional: shows the value, read-only |
| (announcer) | `span` | `clipboard-announcer` | rendered by the Root: the polite live region, visually hidden (Angular: the Root's directive appends it once the page renders in the browser, as its hidden inputs, since a directive renders no child; a server render has none, and the region is there before any copy) |

One entry, `/clipboard` (D8), built on no other component. Its writing and its announcement are
the toolkit's `/clipboard` (`writeClipboard`, `announceText`).

## API

**Root**:

- `value` (a string, required): the text a copy writes.
- `timeout` (`3000`): how long, in milliseconds, the status stays `copied` (or `failed`) before
  it returns to `idle`. A new copy restarts it.
- `onStatusChange(status, details)`: the status changed: `"copied"` (reason `trigger-press`),
  `"failed"` (reason `trigger-press`; `details.error` is what the browser rejected with),
  `"idle"` (reason `none`, the timeout). A copy while already `copied` reports `copied` again.
- `announcement` (a string, optional): written into the live region when a copy succeeds (the
  app's "Copied to clipboard"). Without it nothing is announced.
- `failedAnnouncement` (a string, optional): written into the live region when a copy fails.

**Trigger**: a native `button`; its content and its name are the app's ("Copy", or an icon with
`aria-label="Copy install command"`). A click copies the Root's value.

**Indicator**: renders its children (the app's icons; the recipe shows one or the other by
`data-copied`), or its children function of the state.

**Input**: a native `input`, `readonly`, its value the Root's; every attribute is forwarded (an
`id` for a `<label for>`, `aria-label`).

Every part's `render` and `className` functions, and the Indicator's children function (Vue: the
`render` slot and the Indicator's default scoped slot; Angular: `state()` through `exportAs`,
`#clipboard="clipboardRoot"`), receive the state `{ status, copied, failed }`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root, Trigger, Indicator, Input | `data-copied` while the status is `copied`, `data-failed` while it is `failed` (at most one of them) |
| Trigger | `type="button"` |
| Indicator | `aria-hidden="true"` |
| Input | `readonly`, `value` (the Root's) |
| announcer | `aria-live="polite"`, `aria-atomic="true"`, a structural visually hidden inline style; empty at rest; the announcement's text while `copied` (or the failed one while `failed`), written as a new text node on every copy, so a second copy is announced again; emptied when the status returns to `idle` |

## Keyboard

| key | action |
| --- | --- |
| Enter, Space (on the Trigger) | copies (a native button) |
| Tab | the Trigger is a tab stop; the Input is one too (a read-only input), before or after it as the app places them |

## Focus

A copy keeps the focus on the Trigger. A failed copy with an Input moves the focus to the Input
and selects its whole text; without an Input, the focus stays.

## Pointer

A click on the Trigger copies (reason `trigger-press`).

## Copying

A press calls the toolkit's `writeClipboard(trigger, value)`: the Trigger's window's
`navigator.clipboard.writeText`, in the press's user activation. On success the status becomes
`copied` and the announcement is written; on a rejection it becomes `failed` (the failed
announcement written, the Input focused and selected); either returns to `idle` after `timeout`.
A copy that resolves after the Root unmounted reports nothing. The browser needs a **secure
context** (`https:`, or `localhost`); Chromium grants the write to a user activation in the
focused page, and other browsers may ask for the `clipboard-write` permission.

## RTL

Nothing changes.

## Scenarios

The conformance tests grant the `clipboard-read` and `clipboard-write` permissions to the test
browser and read the clipboard back with `navigator.clipboard.readText()`. The Trigger holds the
Indicator, which holds a copy icon and a check icon (both `aria-hidden`; the recipe shows the
check while `data-copied`).

### `/clipboard/basic`

A `<label for="install">` **"Install command"**, a Root with `value="pnpm add
@fragiola/primitives"`, `timeout={1000}`, `announcement="Copied to clipboard"`, holding an Input
`id="install"` and a Trigger **"Copy install command"** (`aria-label`) with its Indicator.
Output: `status: ...` (the last `onStatusChange`, `none` before any), `reason: ...`.

Checks:

1. A read-only `textbox` named "Install command" holding `pnpm add @fragiola/primitives`; a
   `button` "Copy install command"; the announcer has `aria-live="polite"` and no text.
2. A click on the button writes `pnpm add @fragiola/primitives` to the clipboard, reports
   `status: copied`, `reason: trigger-press`, and puts `data-copied` on every part; the
   announcer's text is "Copied to clipboard"; the focus stays on the button.
3. After the timeout, `status: idle`, `reason: none`; no part has `data-copied`; the announcer is
   empty.
4. Focused on the button, Enter copies (`status: copied`); a second copy writes a new text node
   in the announcer (the contract layer records the insertions).
5. Axe finds no violation, at rest and copied.

### `/clipboard/failure`

The same Root and parts, with `failedAnnouncement="Copy failed: select the text and copy it"`,
in a page where the test makes `navigator.clipboard.writeText` reject (an init script, as a
denied permission does). Output: `status: ...`, `error: <the rejection's message>`.

Checks:

1. A click on "Copy install command" reports `status: failed`, `error: NotAllowedError`, puts
   `data-failed` (no `data-copied`) on every part, and writes the failed announcement.
2. The focus is on the Input, with its whole text selected.
3. After the timeout, `status: idle` and no part has `data-failed`.

## Differences from Base UI and the references

Base UI has no Clipboard. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The Trigger | a plain button, no `aria-pressed` | a copy is an action; the copied state is announced, not toggled |
| The announcement | a polite live region the Root renders, the app's text written into it | WAI-ARIA's live regions, Toast's approach; the primitive has no text of its own |
| The fallback | none: a failed write is a `failed` status, the Input focused and selected | `execCommand("copy")` is deprecated; selecting the text lets the user copy it |
| `defaultValue`, `onValueChange` | not offered: `value` only | the text is the app's (Zag's value is too); nothing in the component edits it |
| `onStatusChange` | `"idle"`, `"copied"`, `"failed"` with a reason | Zag reports `{ copied }`; the failure is a state the app shows |
