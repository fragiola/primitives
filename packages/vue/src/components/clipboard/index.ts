// The entry of @fragiola/primitives-vue/clipboard: a copy button, its copied state and a polite
// announcement (spec/clipboard.md). The copy and the announcement are the toolkit's `/clipboard`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    ClipboardState,
    ClipboardStatus,
} from "./clipboard-context.ts";
export type {
    ClipboardRootEmits,
    ClipboardRootProps,
    ClipboardStatusDetails,
} from "./clipboard-root.ts";
export { Clipboard } from "./parts.ts";
