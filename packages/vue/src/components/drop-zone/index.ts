// The entry of @fragiola/primitives-vue/drop-zone: a drop target for files, an APG button that
// opens the file dialog, takes a paste and announces the app's text (spec/drop-zone.md). Its drop,
// dialog and `accept` filter are the toolkit's `/file`, its announcement `/clipboard`'s.

export type { FileAccept } from "@fragiola/primitives/file";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DropZoneDropDetails,
    DropZoneRootEmits,
    DropZoneRootProps,
    DropZoneState,
} from "./drop-zone-root.ts";
export { DropZone } from "./parts.ts";
