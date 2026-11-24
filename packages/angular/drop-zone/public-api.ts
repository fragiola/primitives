// The entry of @fragiola/primitives-angular/drop-zone: a drop target for files, an APG button
// that opens the file dialog, takes a paste and announces the app's text (spec/drop-zone.md), as a
// standalone directive on the consumer's own element. Its drop, dialog and `accept` filter are the
// toolkit's `/file`, its announcement `/clipboard`'s.

export type { FileAccept } from "@fragiola/primitives/file";
export type {
    ChangeDetails,
    ChangeReason,
} from "@fragiola/primitives-angular/internal";
export {
    type DropZoneDropDetails,
    type DropZoneDropTargetChangeEvent,
    DropZoneRoot,
    type DropZoneState,
} from "./directives/drop-zone-root.directive.ts";
