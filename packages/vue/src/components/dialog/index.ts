// The entry of @fragiola/primitives-vue/dialog: a modal dialog (spec/dialog.md, the APG's
// dialog-modal pattern).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { DialogBackdropState } from "./dialog-backdrop.ts";
export type { DialogPopupProps, DialogPopupState } from "./dialog-popup.ts";
export type { DialogPortalProps } from "./dialog-portal.ts";
export type { DialogRootEmits, DialogRootProps } from "./dialog-root.ts";
export type {
    DialogTriggerProps,
    DialogTriggerState,
} from "./dialog-trigger.ts";
export { Dialog } from "./parts.ts";
