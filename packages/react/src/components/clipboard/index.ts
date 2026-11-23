// The entry of @fragiola/primitives-react/clipboard: a copy button, its copied state and a polite
// announcement (spec/clipboard.md). The copy and the announcement are the toolkit's `/clipboard`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    ClipboardState,
    ClipboardStatus,
} from "./clipboard-context.ts";
export type { ClipboardIndicatorProps } from "./clipboard-indicator.tsx";
export type { ClipboardInputProps } from "./clipboard-input.tsx";
export type {
    ClipboardRootProps,
    ClipboardStatusDetails,
} from "./clipboard-root.tsx";
export type { ClipboardTriggerProps } from "./clipboard-trigger.tsx";
export { Clipboard } from "./parts.ts";
