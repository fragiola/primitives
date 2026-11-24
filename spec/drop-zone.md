# DropZone

## Purpose

A target files are dropped on: dragged from the desktop or a file manager, pasted with Ctrl+V
(⌘V), or picked in the browser's file dialog, which the target opens when it is pressed (Enter,
Space or a click). It reports the files it accepted (by `accept`) and the ones it rejected, and
writes the app's text into a polite live region.

It holds no form value and no list of files: the app keeps what it was given (FileUpload,
[file-upload.md](file-upload.md), is the form control with a list, built on the same drop
target). It is **native file drag only**: dragging the page's own elements (a sortable list, a
board) is drag and drop of elements, `@fragiola/dnd`'s (D5).

**Scope: stage 4** (Epic #106, Issue #105). The APG has no drop zone pattern and Base UI has no
DropZone: React Aria's DropZone is the behaviour reference (read, never copied), and the
APG-closest option is decided here (D4) and recorded in `docs/decisions.md` ("Files"):

- the **Root is an APG button** (`role="button"`, a tab stop): the keyboard path to what a drop
  does. Enter and Space open the file dialog (the press opens it, always: a button that does
  nothing on Enter is not one), Ctrl/⌘+V pastes the clipboard's files on it. React Aria's
  DropZone has a visually hidden button inside a `div` for the same reason; one element is the
  APG-closest (the Root is what the user points at, sees focused and drops on);
- the **file dialog** is the browser's, opened through a file `input` the toolkit creates for the
  press and never puts in the document (`openFileDialog`), with the Root's `accept` and
  `multiple`; no `showOpenFilePicker` (not in every browser);
- the **announcement** is a polite live region the Root renders, empty, with the page, into which
  the app's text is written after each drop, paste or pick: Clipboard's approach
  ([clipboard.md](clipboard.md), written with the toolkit's `/clipboard` `announceText`, not
  Clipboard's code). The primitive has no text of its own.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `drop-zone-root` | the drop target, a button; renders the announcer as its last child |
| (announcer) | `span` | `drop-zone-announcer` | rendered by the Root: the polite live region, visually hidden (Angular: the Root's directive appends it once the page renders in the browser, as Clipboard's; a server render has none) |

One entry, `/drop-zone` (D8), built on no other component. Its drag, drop, paste, press and
dialog handling, its `accept` filter and its announcement are the toolkit's (`/file`:
`watchFileDrop`, `openFileDialog`, `acceptFiles`; `/clipboard`: `announceText`); each framework's
drop target (React `hooks/use-file-drop-target.ts`, Vue `composables/`, Angular `/internal`) is
shared with FileUpload's Dropzone, never through this entry.

The Root holds no focusable element: a `button` may not hold one (axe `nested-interactive`). Its
content is the app's ("Drop files here or press to choose"), which names it; an icon-only Root
takes the app's `aria-label`.

## API

**Root**:

- `accept` (a string or an array of strings, optional): the file types it takes, as an `input`'s
  `accept`: MIME types (`image/png`), wildcards (`image/*`) and extensions (`.pdf`, case
  insensitive), joined by commas. Without it every file is accepted. A drop and a paste are
  filtered by it; the dialog is given it.
- `multiple` (`true`): the dialog lets the user pick several files; when `false`, a drop or a paste
  of more than one file rejects them all (a native file input refuses such a drop).
- `disabled` (`false`): no drop, paste or press does anything; the Root leaves the tab order.
- `onFileDrop(details)`: files arrived. `details`: `{ acceptedFiles, rejectedFiles, reason, event }`
  (`acceptedFiles` and `rejectedFiles` are `File[]`, in the order given; `reason` is `drop`,
  `input-paste` or `input-change` for the dialog). A paste with no file and a dialog closed with no
  file report nothing.
- `onDropTargetChange(active, details)`: a drag of files entered (`true`) or left, dropped or ended
  (`false`); reason `drop`.
- `announcement` (a function `(details) => string`, optional): called with the same details after
  each `onFileDrop`, its text written into the live region (the app's "2 files added, 1 rejected").
  Without it nothing is announced.

Every part's `render` and `className` functions (Vue: the `render` slot; Angular: `state()`
through `exportAs`, `#zone="dropZoneRoot"`) receive the state `{ dropTarget, disabled }`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="button"`, `tabindex="0"` (none while disabled); `data-drop-target` while a drag of files is over it; `data-disabled` and `aria-disabled="true"` while disabled |
| announcer | `aria-live="polite"`, `aria-atomic="true"`, a structural visually hidden inline style; empty at rest; the announcement's text, written as a new text node after each drop, so the same text is announced twice |

## Keyboard

| key | action |
| --- | --- |
| Tab | the Root is a tab stop (none while disabled) |
| Enter, Space | open the file dialog (reason `input-change` when files are picked): Enter on keydown, Space on keyup, as a native button (the focus leaving before Space is released cancels it); Space does not scroll the page |
| Ctrl+V, ⌘V | the browser's `paste` on the focused Root: its files are taken (reason `input-paste`); a paste of text only is ignored |

## Focus

Nothing moves the focus: the dialog returns it to the Root, a drop does not take it.

## Pointer

A click opens the file dialog. A drag of files (`dataTransfer.types` holding `"Files"`) over the
Root sets `data-drop-target` and the `copy` drop effect; nested elements do not end it (the Root
counts the drag's enters and leaves); a drop takes its files (reason `drop`). A drag of anything
else (text, a link, an element of the page) is not a drop target and its drop is left alone.
While disabled, a drag of files shows the `none` effect and its drop does nothing (the browser
does not open the dropped file either).

## RTL

Nothing changes.

## Scenarios

The conformance suite builds the files in the page (`new File()`) and hands them over through a
`DataTransfer` it builds there too (`conformance/src/files.ts`): `dragenter`, `dragover`,
`dragleave` and `drop` events carrying it, and a `paste` event whose `clipboardData` it is. The
dialog is Playwright's file chooser (`page.waitForEvent("filechooser")`). Every check runs in
Chromium, the suite's browser.

### `/drop-zone/basic`

A Root with `accept="image/*,.pdf"`, the text **"Drop images or PDFs here, or press to choose"**,
and `announcement={(d) => \`${d.acceptedFiles.length} accepted, ${d.rejectedFiles.length} rejected\`}`.
Output: `accepted: ...` (the last `onFileDrop`'s accepted names, joined by `, `; `none` for none
or before any), `rejected: ...` (the same), `reason: ...`, `dropTarget: ...` (the last
`onDropTargetChange`, `false` before any).

Checks:

1. A `button` named "Drop images or PDFs here, or press to choose", a tab stop; the announcer has
   `aria-live="polite"`, no text, and is the Root's last child.
2. A drag of files entering the Root sets `data-drop-target` (`dropTarget: true`); entering and
   leaving a child of the Root keeps it; leaving the Root removes it (`dropTarget: false`).
3. Dropping `photo.png`, `notes.txt` and `scan.PDF` reports `accepted: photo.png, scan.PDF`,
   `rejected: notes.txt`, `reason: drop`, removes `data-drop-target`, and writes
   "2 accepted, 1 rejected" in the announcer.
4. A drag of text only sets no `data-drop-target`.
5. Focused, Enter opens the file dialog (with `accept="image/*,.pdf"` and `multiple`); picking
   `a.png` reports `accepted: a.png`, `reason: input-change`. Space opens it too, and so does a
   click.
6. A paste of `b.png` on the focused Root reports `accepted: b.png`, `reason: input-paste`; a
   paste of text only reports nothing new.
7. Axe finds no violation, at rest and while a drag is over it.

### `/drop-zone/single`

The same Root with `multiple={false}`, no `accept`.

Checks:

1. Dropping `a.png` and `b.png` together rejects both (`accepted: none`, `rejected: a.png, b.png`).
2. Dropping `c.png` alone accepts it. The dialog opened by Enter takes one file (no `multiple`).

### `/drop-zone/disabled`

The same Root as basic with `disabled`.

Checks:

1. `aria-disabled="true"`, `data-disabled`, no `tabindex`: Tab does not reach it.
2. A drag of files sets no `data-drop-target`; its drop reports nothing.
3. A click opens no file dialog.

## Differences from Base UI and the references

Base UI has no DropZone. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The target | one `role="button"` element | the APG button is the keyboard path; React Aria's hidden button inside a `div` splits what is pointed at from what is focused |
| The press | always opens the file dialog | a button must do something on Enter; React Aria leaves it to a FileTrigger inside |
| The dialog | a file input created for the press, never in the document | no hidden input part to place; `showOpenFilePicker` is Chromium's only |
| `multiple={false}` | a drop of several files rejects them all | a native file input refuses it; picking one of them would be arbitrary |
| Elements | not a drop target | element drag and drop is `@fragiola/dnd`'s (D5) |
| The announcement | a polite live region, the app's text | Clipboard's approach; React Aria announces its own text |
