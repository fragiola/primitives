---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

DropZone and FileUpload, natively in React, Vue and Angular, each in its own entry. `/drop-zone` (`DropZone.Root`): a drop target for files (native file drag only), an APG button that opens the browser's file dialog on Enter, Space or a click and takes a paste of files (Ctrl/⌘+V), `accept` filtering into accepted and rejected files, `multiple`, `disabled`, `data-drop-target` while files are dragged over it, and a polite live region the app's `announcement` text is written into. `/file-upload` (`FileUpload`: `Root`, `Label`, `Dropzone`, `Trigger`, `HiddenInput`, `ItemGroup`, `Item`, `ItemName`, `ItemSizeText`, `ItemPreview`, `ItemPreviewImage`, `ItemDeleteTrigger`, `ClearTrigger`): a form control holding the accepted files (`value`), checked by `accept`, `maxFiles`, `minFileSize`, `maxFileSize` and `validate` into a rejected list with its reasons (`invalid-type`, `too-large`, `too-small`, `too-many`, the app's own), sizes in the locale's decimal bytes from `Intl.NumberFormat`, image previews through object URLs revoked when they unmount, the focus moved on when an Item is deleted, and a Field control whose files reach the native form through its hidden file input (assigned with a `DataTransfer`), `required` and form reset included; no upload transport. The toolkit gains `/file` (`watchFileDrop`, `openFileDialog`, `acceptsFile`, `acceptFiles`, `checkFiles`, `formatFileSize`, `assignFiles`). Every other entry is unchanged.
