# FileUpload

## Purpose

A form control that holds a list of files: picked in the browser's file dialog (a Trigger, the
Label, or the Dropzone pressed), dropped on its Dropzone or pasted on it. It checks each file
(`accept`, `maxFiles`, `minFileSize`, `maxFileSize`, `validate`) into an accepted list, its
value, and a rejected list with the reasons; it renders the app's Items for them (a name, a
localized size, an image preview, a delete button) and submits the accepted files with the native
form, through its hidden file input.

It does **not upload**: no request, no progress, no retry. The app reads the value (or the
form's `FormData`) and sends it. An avatar uploader, an attachments field and a document picker
are FileUploads; a target that only reports what was dropped is a DropZone
([drop-zone.md](drop-zone.md)).

**Scope: stage 4** (Epic #106, Issue #105). The APG has no file upload pattern and Base UI has no
FileUpload: Zag/Ark's and Kobalte's FileUpload are the behaviour references (read, never copied),
and the APG-closest option is decided here (D4) and recorded in `docs/decisions.md` ("Files"):

- the **controls are APG buttons**: the Trigger (a native `button`), the Dropzone (DropZone's
  `role="button"`, the same drop target), each Item's delete button and the ClearTrigger; the
  file `input` itself is hidden from the tab order and the accessibility tree (its native button
  has no name of the app's and cannot be styled);
- **the files reach the form through the hidden input**: after every change the accepted files
  are assigned to it (`input.files = dataTransfer.files`, a `DataTransfer` built with them, the
  toolkit's `assignFiles`), so the native form submits them, `required` validates them, and a
  `FormData` holds them. Verified in Chromium (the conformance suite's browser); Firefox (57+) and
  Safari (14.1+) accept the same assignment by the HTML standard, not verified here;
- the **checks** run in order on each new file and every failing one is a reason: `invalid-type`
  (`accept`), `too-large`, `too-small`, the app's own (`validate`), and `too-many` (`maxFiles`,
  the files over the limit in the order given). A pick replaces the rejected list;
- **one file** (`maxFiles` `1`, the default) is a native single file input: a new pick replaces
  the file, and a drop of several files rejects them all (`too-many`).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `file-upload-root` | holds the files; `role="group"`; renders the announcer as its last child |
| Label | `label` | `file-upload-label` | `for` the HiddenInput (a press opens the dialog); names the Root |
| Dropzone | `div` | `file-upload-dropzone` | DropZone's drop target (`role="button"`), its press opening the HiddenInput's dialog |
| Trigger | `button` | `file-upload-trigger` | opens the dialog; `type="button"` |
| HiddenInput | `input` | `file-upload-hidden-input` | `type="file"`, the form's control; visually hidden, `tabindex="-1"`, `aria-hidden="true"` |
| ItemGroup | `ul` | `file-upload-item-group` | the list of Items |
| Item | `li` | `file-upload-item` | one file (`file`), accepted or rejected |
| ItemName | `span` | `file-upload-item-name` | the file's name (the default content) |
| ItemSizeText | `span` | `file-upload-item-size-text` | the file's size in the locale's bytes (the default content) |
| ItemPreview | `div` | `file-upload-item-preview` | rendered only for a file of its `type` (`image/*`) |
| ItemPreviewImage | `img` | `file-upload-item-preview-image` | the file through an object URL |
| ItemDeleteTrigger | `button` | `file-upload-item-delete-trigger` | removes the Item's file; `type="button"` |
| ClearTrigger | `button` | `file-upload-clear-trigger` | removes every file; `type="button"`; `hidden` while there is none |
| (announcer) | `span` | `file-upload-announcer` | rendered by the Root: the polite live region (Angular: appended in the browser, as Clipboard's) |

One entry, `/file-upload` (D8), built on Field (`ENTRY_DEPENDENCIES` `["field"]`). Its checks,
sizes, assignment and drop target are the toolkit's `/file` (`checkFiles`, `formatFileSize`,
`assignFiles`, `watchFileDrop`); its Dropzone shares DropZone's drop target through each
framework's shared code, never DropZone's entry; its announcement is the toolkit's `/clipboard`
`announceText`; its form side the toolkit's `/form` (`bridgeForm`, `VISUALLY_HIDDEN_INPUT_STYLE`).

## API

**Root**:

- `value` / `defaultValue` (`File[]`, `[]`) / `onValueChange(value, details)`: the accepted files.
  Reasons: `drop`, `input-paste` (the Dropzone), `input-change` (the dialog), `delete-press` (an
  ItemDeleteTrigger), `clear-press` (the ClearTrigger), `none` (a form reset).
- `onFileReject(rejections, details)`: a pick had rejected files (`{ file, reasons }[]`, reasons
  among `invalid-type`, `too-large`, `too-small`, `too-many` and the app's own), with the pick's
  reason.
- `accept` (a string or an array of strings): DropZone's (`image/*,.pdf`); the HiddenInput's
  `accept`.
- `maxFiles` (`1`): at most this many accepted files; over `1`, the HiddenInput is `multiple` and a
  pick adds to the value.
- `minFileSize` (`0`), `maxFileSize` (`Infinity`): bytes, inclusive.
- `validate(file, value)` (optional): the app's own reasons for a file (`["name-has-spaces"]`), or
  `null` / `[]` for none, `value` the files accepted so far.
- `name`, `required`, `disabled`, `capture` (`"user"` / `"environment"`, the HiddenInput's), `id`
  (the HiddenInput's; a Field gives its control id).
- `locale` (a BCP 47 tag; default the runtime's): ItemSizeText's.
- `announcement` (a function `({ value, acceptedFiles, rejectedFiles, reason }) => string`):
  called after each pick (drop, paste, dialog), its text written into the live region.
- children: the content, or a function of the state (React `children({ value, rejectedFiles })`,
  Vue the default scoped slot, Angular `state()` through `exportAs`, `#upload="fileUploadRoot"`).

**Label**: a native `label`, `for` the HiddenInput; its id names the Root (`aria-labelledby`).
**Dropzone**: DropZone's Root behaviour (`data-drop-target`, Enter / Space / a click open the
dialog, Ctrl/⌘+V pastes), the Root's `accept`, `maxFiles` and `disabled`; no announcer of its own.
**Trigger**: a native `button`; a click opens the dialog (`input.click()` on the HiddenInput).
**HiddenInput**: the native file `input`; `name`, `accept`, `multiple`, `capture`, `required`,
`disabled`, `id` from the Root.
**Item**: `file` (required), an accepted file (in `value`) or a rejected one (in `rejectedFiles`).
**ItemName**, **ItemSizeText**: their content is the file's name and its size
(`formatFileSize(file.size, locale)`) unless the app gives children.
**ItemPreview**: `type` (`"image/*"`, an `accept` pattern): renders its children only for a file
of that type. **ItemPreviewImage**: `src` is the file's object URL; `alt` is the app's.
**ItemDeleteTrigger**: removes its Item's file from the value (or from the rejected list).
**ClearTrigger**: empties the value and the rejected list.

The state, `{ value, rejectedFiles, disabled, empty, dropTarget }`, reaches the parts' `render`
and `className` functions; the Item parts' also hold `{ file, rejected, reasons }`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="group"`, `aria-labelledby` the Label (in a Field: the Field's label and `aria-describedby`, `aria-invalid`); `data-disabled`, `data-empty` (no accepted file), `data-drop-target` while a drag of files is over the Dropzone; a Field's state attributes |
| Dropzone | DropZone's: `role="button"`, `tabindex="0"` (none while disabled), `data-drop-target`, `aria-disabled` and `data-disabled` |
| Trigger, ItemDeleteTrigger, ClearTrigger | `type="button"`, `disabled` while the Root is |
| ClearTrigger | `hidden` while the value and the rejected list are empty |
| HiddenInput | `type="file"`, `tabindex="-1"`, `aria-hidden="true"`, the structural visually hidden style; `multiple` when `maxFiles` is over 1; its `files` the value |
| Item and its parts | `data-rejected` for a rejected file |
| ItemPreviewImage | `src` a `blob:` URL; the URL is revoked when its file leaves both lists and when the Root unmounts |
| announcer | Clipboard's: `aria-live="polite"`, `aria-atomic="true"`, empty at rest, a new text node per pick |

ItemSizeText writes **decimal units** (`Intl.NumberFormat` `style: "unit"`, `byte`, `kilobyte`,
`megabyte`, `gigabyte`, `terabyte`, `unitDisplay: "short"`, one fraction digit above bytes):
`Intl`'s units are the SI ones (1 kB = 1000 bytes), so `en-US` writes `512 byte`, `1.5 kB`,
`2 MB`. It is locale data, the calendars' exception ([README.md](README.md#no-text-and-the-exceptions));
the app's children replace it.

## Keyboard

| key | action |
| --- | --- |
| Tab | the Dropzone, the Trigger, every ItemDeleteTrigger and the ClearTrigger are tab stops, in the app's order; the HiddenInput is none |
| Enter, Space | on the Dropzone or the Trigger: open the dialog; on a delete button or the ClearTrigger: press it |
| Ctrl+V, ⌘V | on the Dropzone: its files are picked (reason `input-paste`) |

## Focus

A deleted Item's button moves the focus to the next Item's ItemDeleteTrigger, else the previous
one's, else the Trigger, else the Dropzone (the focus is never lost to the page). The ClearTrigger
(then hidden) moves it to the Trigger, else the Dropzone. A form's failed validation focuses the
Trigger, else the Dropzone, as the hidden inputs of the other controls do (`bridgeForm`).

## Pointer

A click on the Trigger, the Label or the Dropzone opens the dialog; drops are DropZone's.

## Forms

The HiddenInput carries `name`, and its `files` are the value after every change; a form submits
each file under `name` (`FormData.getAll(name)` holds the `File`s). `required` is the native
`valueMissing` of an input with no file. A form reset empties the input (the browser) and returns
the Root to `defaultValue` (reason `none`, no Field change), the rejected list emptied. In a Field
(spec/field.md) the Root reports its value (the files), its filled state (a file) and the input's
validity; the Field's label is `for` the HiddenInput.

## RTL

Nothing changes.

## Scenarios

Files are built in the page and handed over as in [drop-zone.md](drop-zone.md#scenarios); an image
file holds a small valid PNG padded with zeros to its size. The rejected Items show their reasons
as the app's text. Every check runs in Chromium.

### `/file-upload/basic`

An attachments uploader: a Root with `maxFiles={3}`, `accept="image/*,.pdf"`,
`maxFileSize={1_000_000}`, `minFileSize={1}`, `validate={(file) => file.name.includes(" ") ?
["name-has-spaces"] : null}`, `locale="en-US"`, and `announcement={(d) => \`${d.value.length}
files, ${d.rejectedFiles.length} rejected\`}`; inside it a Label **"Attachments"**, a Dropzone
**"Drop files here"**, a Trigger **"Choose files"**, the HiddenInput, an ItemGroup of the accepted
files (each Item: an ItemPreview with an ItemPreviewImage `alt=""`, its ItemName, its ItemSizeText
and an ItemDeleteTrigger **"Remove <name>"**), an ItemGroup of the rejected files (each Item: its
ItemName, the reasons joined by `, `, and an ItemDeleteTrigger **"Dismiss <name>"**), and a
ClearTrigger **"Clear all"**. Output: `value: ...` (the names, joined by `, `; `none`),
`rejected: ...` (each `name (reasons)`, joined by `; `; `none`), `reason: ...`.

Checks:

1. A `group` named "Attachments"; a `button` "Drop files here"; a `button` "Choose files"; the
   HiddenInput is `type="file"`, `multiple`, `accept="image/*,.pdf"`, `tabindex="-1"`,
   `aria-hidden="true"`; the ClearTrigger is hidden; the Root has `data-empty`.
2. Dropping `photo.png` (1 500 bytes), `notes.txt` (10), `big.png` (2 000 000) and `my scan.pdf`
   (100) reports `value: photo.png`, `reason: drop` and
   `rejected: notes.txt (invalid-type); big.png (too-large); my scan.pdf (name-has-spaces)`; the
   Item of `photo.png` shows `1.5 kB`, and its preview image has a `blob:` source and loads; the
   announcer says "1 files, 3 rejected"; the HiddenInput's `files` hold `photo.png`.
3. The Trigger opens the dialog (`multiple`); picking `a.pdf`, `b.png`, `c.png` reports
   `value: photo.png, a.pdf, b.png`, `reason: input-change`, `rejected: c.png (too-many)` (the
   earlier rejections replaced); the HiddenInput's `files` hold the three.
4. "Remove a.pdf" reports `value: photo.png, b.png`, `reason: delete-press`, and moves the focus
   to "Remove b.png"; "Remove b.png" then moves it to "Remove photo.png". A removed image's object
   URL is revoked (a `fetch` of it fails).
5. "Dismiss c.png" removes it from the rejected list (`rejected: none`), the value unchanged.
6. A paste of `d.png` on the focused Dropzone reports `reason: input-paste`; Enter on the Dropzone
   opens the dialog.
7. "Clear all" reports `value: none`, `reason: clear-press`; the ClearTrigger is hidden and the
   focus is on "Choose files"; the HiddenInput holds no file.
8. Axe finds no violation, empty and with accepted and rejected Items.

### `/file-upload/single`

An avatar uploader: a Root with `accept="image/*"` (`maxFiles` `1`), a Label **"Avatar"**, a
Dropzone **"Drop an image"**, a Trigger **"Choose image"**, the HiddenInput and one Item for the
value with its ItemPreview and ItemPreviewImage `alt="Avatar preview"`. Output: `value: ...`,
`rejected: ...`, `reason: ...`.

Checks:

1. The HiddenInput has no `multiple`.
2. Dropping `a.png` sets `value: a.png`; dropping `b.png` replaces it (`value: b.png`) and revokes
   `a.png`'s object URL.
3. Dropping `c.png` and `d.png` together rejects both (`too-many`), the value unchanged.

### `/file-upload/form`

A native `form` with a Field.Root `name="attachments"` holding a Field.Label **"Documents"**, a
FileUpload (`maxFiles={5}`, `required`) with a Dropzone **"Drop documents"**, a Trigger
**"Choose documents"**, the HiddenInput and the Items (ItemName, ItemDeleteTrigger "Remove
<name>"), and a Field.Error **"Add at least one document"** (`match="valueMissing"`); then a
submit button **"Send"** and a reset button **"Reset"**. The form's submit is prevented and the
fixture prints the `FormData`. Output: `submitted: ...` (each `FormData.getAll("attachments")`
entry as `name:size`, joined by `, `; `none`), `value: ...`, `reason: ...`.

Checks:

1. The Field's label is `for` the HiddenInput; the Root is labelled by it.
2. "Send" with no file submits nothing, shows "Add at least one document", focuses "Choose
   documents", and the Root has `aria-invalid="true"` and `data-invalid`.
3. Dropping `a.pdf` (100) and `b.png` (2 000) then "Send" reports `submitted: a.pdf:100, b.png:2000`
   (the native submission through the HiddenInput's assigned files); the error is gone.
4. "Reset" reports `value: none`, `reason: none`; the HiddenInput holds no file; "Send" is invalid
   again.

### `/file-upload/disabled`

The basic Root with `disabled`.

Checks:

1. The Trigger and the HiddenInput are `disabled`; the Dropzone has `aria-disabled="true"` and no
   tab stop; the Root has `data-disabled`.
2. A drop on the Dropzone changes nothing.

## Differences from Base UI and the references

Base UI has no FileUpload. The decisions where the APG is silent:

| topic | decision | reason |
| --- | --- | --- |
| The upload | none: the app sends the value | transport, progress and retries are the app's (the Epic's out of scope) |
| The hidden input | `aria-hidden`, out of the tab order; the Trigger and the Dropzone are the controls | a native file input's button has the browser's text (no text of the library's own) and cannot be styled |
| The form | the accepted files assigned to the input (`DataTransfer`) | the native form, `required` and `FormData` work with no hidden input per file (a `File` cannot be a hidden input's value) |
| One file | a new pick replaces it | a native single file input's behaviour; Zag rejects it instead |
| `too-many` | the files over the limit are rejected, the first ones kept | the user keeps what fits; Zag rejects the whole pick |
| The rejected list | replaced by each pick | it explains the last pick; Zag's too |
| Sizes | decimal units from `Intl.NumberFormat` | `Intl`'s byte units are SI; no text of the library's own |
| Previews | object URLs revoked on removal and unmount | an object URL holds its file in memory until revoked |
| Deleting | the focus moves to the next delete button | a removed focused button would lose the focus to the page (Zag leaves it) |
